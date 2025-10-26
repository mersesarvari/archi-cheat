// src/scraper/helpers.ts
import { Page } from "patchright";
import path from "path";
import fs from "fs";
import { extractTextFromImage } from "../utils/orc-helper";
import { sendTextToGemini } from "../utils/gemini";

const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots/test");
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

export async function processScreenshotAndSolve(
  page?: Page,
  filePath?: string
): Promise<string> {
  let screenshotPath = filePath;

  // If no file provided, take screenshot from page
  if (!screenshotPath) {
    if (!page) throw new Error("Either a Page or filePath must be provided.");

    const timestamp = Date.now();
    screenshotPath = path.join(SCREENSHOT_DIR, `screenshot-${timestamp}.png`);
    console.log("Screenshot path:", screenshotPath);

    const content = await page.$("#page");
    if (content) {
      await content.screenshot({ path: screenshotPath });
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
    } else {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.warn(
        "⚠️ Could not find #page element, full page screenshot taken."
      );
    }
  }

  // Extract text
  console.log("📝 Extracting text from screenshot...");
  const text = await extractTextFromImage(screenshotPath);
  console.log("📝 Extracted text:\n", text);

  // Send to Gemini
  let result = "";
  if (process.env.GEMINI_API_KEY) {
    try {
      result = await sendTextToGemini(process.env.GEMINI_API_KEY, text);
      console.log("🤖 Gemini response:\n", result);
    } catch (err) {
      console.error("❌ Error during Gemini API call:", err);
    }
  }

  return result;
}
