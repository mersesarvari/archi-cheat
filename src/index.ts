import path from "path";
import { MoodleScraper } from "./scraper/moodle-scraper";
import { processScreenshotAndSolve } from "./utils/image-helper";
import { loginToMoodle } from "./utils/moodle-login";
import "dotenv/config";
import { injectAutoFillShortcut } from "./utils/UI";

async function main() {
  const scraper = new MoodleScraper();
  // 1️⃣ Initialize browser and page
  await scraper.init();

  //Testing
  /* const testImagePath = path.join(
    process.cwd(),
    "screenshots",
    "test",
    "image.png"
  );
  const test = await processScreenshotAndSolve(undefined, testImagePath);
 */
  // Automate login
  await loginToMoodle(scraper.page);

  // 2️⃣ Go to initial Moodle page
  await scraper.goto("https://llm.elearning.uni-obuda.hu/");

  await injectAutoFillShortcut(scraper.page);

  // 3️⃣ Inject screenshot button (function exposed once)
  await scraper.injectScreenshotButton();

  console.log(
    "✅ Ready! Interact with the page and click the screenshot button."
  );

  // 4️⃣ Optional: monitor for navigation and reinject the button automatically
  scraper.page.on("framenavigated", async (frame) => {
    if (frame === scraper.page.mainFrame()) {
      console.log("🌐 Page navigated, reinjecting screenshot button...");
      await scraper.injectScreenshotButton();
    }
  });
}

main().catch(console.error);
