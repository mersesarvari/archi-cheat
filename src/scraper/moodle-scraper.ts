import { chromium, Page } from "patchright";
import { processScreenshotAndSolve } from "../utils/image-helper";
import {
  injectButton,
  injectToggleModalButton,
  showGeminiModal,
} from "../utils/UI";

export class MoodleScraper {
  browser: any;
  context: any;
  page!: Page;
  screenshotFunctionExposed = false;

  async init() {
    this.browser = await chromium.launch({
      headless: false,
      args: ["--start-maximized"], // open window maximized
    });
    this.context = await this.browser.newContext({
      viewport: null, // use the full available window size
    });
    this.page = await this.context.newPage();

    if (!this.screenshotFunctionExposed) {
      await this.page.exposeFunction("takeScreenshot", async () => {
        console.log(
          "📸 Taking screenshot (excluding header/footer and UI buttons)…"
        );

        // Hide header, footer, and custom UI buttons temporarily
        await this.page.evaluate(() => {
          const elementsToHide = [
            document.querySelector("header"),
            document.querySelector("footer"),
            document.querySelector("#header"),
            document.querySelector("#footer"),
            document.querySelector(".site-header"),
            document.querySelector(".site-footer"),
            document.getElementById("screenshot-btn"),
            document.getElementById("toggle-modal-btn"),
            document.getElementById("gemini-modal"),
          ].filter(Boolean) as HTMLElement[];

          elementsToHide.forEach((el) => {
            (el as any).__originalDisplay = el.style.display;
            el.style.display = "none";
          });
        });

        // Take screenshot and process it
        const result = await processScreenshotAndSolve(this.page);

        // Restore hidden elements
        await this.page.evaluate(() => {
          const allEls = [
            document.querySelector("header"),
            document.querySelector("footer"),
            document.querySelector("#header"),
            document.querySelector("#footer"),
            document.querySelector(".site-header"),
            document.querySelector(".site-footer"),
            document.getElementById("screenshot-btn"),
            document.getElementById("toggle-modal-btn"),
            document.getElementById("gemini-modal"),
          ].filter(Boolean) as HTMLElement[];

          allEls.forEach((el) => {
            if ((el as any).__originalDisplay !== undefined) {
              el.style.display = (el as any).__originalDisplay;
              delete (el as any).__originalDisplay;
            }
          });
        });

        // Store and show Gemini response
        await this.page.evaluate((text: string) => {
          (window as any).__lastGeminiText = text;
        }, result);

        await showGeminiModal(this.page, result);
        console.log("✅ Screenshot taken and modal displayed");
        return result;
      });

      this.screenshotFunctionExposed = true;
    }
  }

  async goto(url: string) {
    await this.page.goto(url);
    console.log(`🌐 Opened page: ${url}`);
  }

  async injectScreenshotButton() {
    await injectButton(this.page, "screenshot-btn", "Solve", "takeScreenshot", {
      top: 10,
      left: 10,
    });
    await injectToggleModalButton(this.page);
  }

  async close() {
    await this.browser.close();
  }
}
