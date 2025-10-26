// src/scraper/moodle-scraper.ts
import { chromium, Page } from "patchright";
import fs from "fs";
import path from "path";
import { extractTextFromImage } from "../utils/orc-helper";
import { sendTextToGemini } from "../utils/gemini";

const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

export class MoodleScraper {
  browser: any;
  context: any;
  page!: Page;
  screenshotFunctionExposed = false;

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    // Expose takeScreenshot once
    if (!this.screenshotFunctionExposed) {
      await this.page.exposeFunction("takeScreenshot", async () => {
        const timestamp = Date.now();
        const filePath = path.join(
          SCREENSHOT_DIR,
          `screenshot-${timestamp}.png`
        );

        // Hide header/footer temporarily
        await this.page.evaluate(() => {
          const header = document.getElementById("header");
          const footer = document.getElementById("page-footer");
          if (header) header.style.display = "none";
          if (footer) footer.style.display = "none";
        });

        // Take screenshot of main content
        const content = await this.page.$("#page");
        if (content) {
          await content.screenshot({ path: filePath });
          console.log(`✅ Screenshot saved: ${filePath}`);
        } else {
          await this.page.screenshot({ path: filePath, fullPage: true });
          console.warn(
            "⚠️ Could not find #page element, full page screenshot taken."
          );
        }

        // Restore header/footer
        await this.page.evaluate(() => {
          const header = document.getElementById("header");
          const footer = document.getElementById("page-footer");
          if (header) header.style.display = "";
          if (footer) footer.style.display = "";
        });

        // Extract text using OCR
        console.log("📝 Extracting text from screenshot...");
        const text = await extractTextFromImage(filePath);
        console.log("📝 Extracted text:\n", text);

        // Send to Gemini
        try {
          const result = await sendTextToGemini(
            process.env.GEMINI_API_KEY!,
            text
          );
          console.log("🤖 Gemini response:", result);

          // Show response in a modal
          await this.page.evaluate((respText) => {
            // Remove existing modal
            const existing = document.getElementById("gemini-modal");
            if (existing) existing.remove();

            // Overlay
            const overlay = document.createElement("div");
            overlay.id = "gemini-modal";
            overlay.style.position = "fixed";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
            overlay.style.display = "flex";
            overlay.style.justifyContent = "center";
            overlay.style.alignItems = "center";
            overlay.style.zIndex = "10000";

            // Modal box
            const box = document.createElement("div");
            box.style.background = "#fff";
            box.style.padding = "20px";
            box.style.borderRadius = "8px";
            box.style.maxWidth = "80%";
            box.style.maxHeight = "80%";
            box.style.overflowY = "auto";
            box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

            // Close button
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "Close";
            closeBtn.style.marginBottom = "10px";
            closeBtn.onclick = () => overlay.remove();

            // Content
            const contentEl = document.createElement("pre");
            contentEl.textContent = respText;
            contentEl.style.whiteSpace = "pre-wrap";

            box.appendChild(closeBtn);
            box.appendChild(contentEl);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
          }, result);
        } catch (error) {
          console.error("❌ Error during Gemini API call:", error);
        }

        return text;
      });

      this.screenshotFunctionExposed = true;
    }
  }

  async goto(url: string) {
    await this.page.goto(url);
    console.log(`🌐 Opened page: ${url}`);
  }

  async injectScreenshotButton() {
    await this.page.waitForSelector("body");

    const buttonExists = await this.page.$("#screenshot-btn");
    if (buttonExists) return;

    await this.page.evaluate(() => {
      const btn = document.createElement("button");
      btn.id = "screenshot-btn";
      btn.textContent = "📸 Capture Screenshot";
      btn.style.position = "fixed";
      btn.style.top = "10px";
      btn.style.left = "10px";
      btn.style.zIndex = "9999";
      btn.style.padding = "8px 12px";
      btn.style.background = "#007bff";
      btn.style.color = "#fff";
      btn.style.border = "none";
      btn.style.borderRadius = "4px";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "14px";

      btn.onclick = async () => {
        const text = await (window as any).takeScreenshot();
        console.log("🖋️ Text extracted from screenshot:", text);
      };

      document.body.appendChild(btn);
    });

    console.log("✅ Screenshot button injected at top-left.");
  }

  async close() {
    await this.browser.close();
  }
}
