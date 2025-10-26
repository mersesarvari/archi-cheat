import { chromium, Page } from "patchright";
import { processScreenshotAndSolve } from "../utils/image-helper";
import { injectButton, showGeminiModal } from "../utils/UI";

export class MoodleScraper {
  browser: any;
  context: any;
  page!: Page;
  screenshotFunctionExposed = false;

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    if (!this.screenshotFunctionExposed) {
      await this.page.exposeFunction("takeScreenshot", async () => {
        const result = await processScreenshotAndSolve(this.page);
        await showGeminiModal(this.page, result);
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
    await injectButton(
      this.page,
      "screenshot-btn",
      "Solve Questions",
      "takeScreenshot",
      { top: 10, left: 10 }
    );
  }

  async close() {
    await this.browser.close();
  }
}
