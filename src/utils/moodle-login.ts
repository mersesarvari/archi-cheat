// src/utils/moodle-login.ts
import { Page } from "patchright";

/**
 * Automates login to Moodle.
 * Expects environment variables:
 *   MOODLE_USERNAME
 *   MOODLE_PASSWORD
 */
export async function loginToMoodle(page: Page) {
  const username = process.env.MOODLE_USERNAME;
  const password = process.env.MOODLE_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Environment variables MOODLE_USERNAME and MOODLE_PASSWORD must be set."
    );
  }

  // Go to login page
  await page.goto("https://llm.elearning.uni-obuda.hu/login/index.php");

  // Wait for username input to be visible
  await page.waitForSelector("#username");

  // Fill username & password
  await page.fill("#username", username);
  await page.fill("#password", password);

  // Click the login button
  await page.click("#loginbtn");

  // Wait for navigation or some element that only exists after login
  // Here we wait for main page content (you can adjust if needed)
  await page.waitForSelector("#page");

  console.log("✅ Logged in successfully!");
}
