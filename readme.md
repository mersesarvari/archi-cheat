# Moodle AI Scraper

A Node.js tool to automate Moodle browsing, take screenshots of course pages, extract text via OCR, and query Google Gemini AI for questions & answers.

Built with **Patchright** (Playwright wrapper), **Tesseract.js**, and **Google Gemini API**.

---

## Features

- Automatic login to Moodle using environment variables.
- Capture screenshots of Moodle course content.
- Extract text from screenshots using OCR (Tesseract.js).
- Optionally use PDF files as context for AI answers.
- Query Gemini AI (`gemini-2.5-flash`) to detect questions and provide answers.
- Injects a floating "📸 Capture Screenshot" button in Moodle pages.
- Displays Gemini responses directly in a modal on the page.

---

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Install Playwright and required browsers:

```bash
npx playwright install
```

4. Create a .env file in the project root with your credentials:

```env
GEMINI_API_KEY="your api key"
GEMINI_MODEL="gemini-2.5-flash"
MOODLE_USERNAME="your moodle username"
MOODLE_PASSWORD="your moodle password"
```
