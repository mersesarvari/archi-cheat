import { chromium, BrowserContext, Page } from "patchright";
import cheerio from "cheerio";
import fs from "fs";
import path from "path";
import readline from "readline";

export class Scraper {
  public browserContext: BrowserContext | null = null;
  private storagePath = path.resolve("auth/storageState.json");
  private profilePath = path.resolve("auth/playwright-profile"); // persistent folder

  constructor() {}

  async initializeBrowser() {
    if (!this.browserContext) {
      // Ensure persistent folder exists
      if (!fs.existsSync(this.profilePath))
        fs.mkdirSync(this.profilePath, { recursive: true });

      // Launch persistent context with realistic settings
      this.browserContext = await chromium.launchPersistentContext(
        this.profilePath,
        {
          headless: false, // set to true after first login if needed
          viewport: { width: 1366, height: 768 },
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        }
      );

      // If storageState.json doesn't exist, prompt manual login
      if (!fs.existsSync(this.storagePath)) {
        const page = await this.browserContext.newPage();
        await page.goto("https://www.facebook.com");

        console.log("Please log in manually in the opened browser.");
        await new Promise<void>((resolve) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.question(
            "Press Enter to save your login session to storageState.json...\n",
            () => {
              rl.close();
              resolve();
            }
          );
        });

        await this.browserContext.storageState({ path: this.storagePath });
        console.log("Login session saved!");
      }
    }
  }

  async newPage(url: string): Promise<Page> {
    if (!this.browserContext) await this.initializeBrowser();
    const page = await this.browserContext!.newPage();

    // Override navigator properties immediately after opening the page
    await page.evaluate(() => {
      Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
      Object.defineProperty(navigator, "language", { get: () => "en-US" });
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    return page;
  }

  async closeBrowser() {
    if (this.browserContext) {
      await this.browserContext.close();
      this.browserContext = null;
    }
  }

  async cleanHTML(html: string): Promise<string> {
    const $ = cheerio.load(html);
    $("script, style, meta, link, noscript").remove();
    $("[style]").removeAttr("style");
    $(
      "[on-click], [on-change], [on-file-success], [on-add], [on-file-failure], [on-value-change]"
    ).each((_, el) => {
      Object.keys(el.attribs).forEach((attr) => {
        if (attr.startsWith("on-")) $(el).removeAttr(attr);
      });
    });
    $("template").remove();
    $("*").each((_, el) => {
      if ($(el).html()) {
        $(el).html(
          $(el)
            .html()!
            .replace(/{{[^}]+}}/g, "")
        );
      }
    });
    return $.html();
  }

  async exportPageHTML(url: string): Promise<string> {
    const page = await this.newPage(url);
    const bodyHandle = await page.$("body");
    const html = await bodyHandle?.evaluate((e) => e.innerHTML);
    const cleaned = await this.cleanHTML(html || "");
    await page.close();
    return cleaned;
  }

  async exportPageText(url: string): Promise<string> {
    const page = await this.newPage(url);
    const bodyHandle = await page.$("body");
    const text = await bodyHandle?.evaluate((e) => e.innerText);
    await page.close();
    return text || "";
  }
}
