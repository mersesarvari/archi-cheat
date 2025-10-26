import Tesseract from "tesseract.js";

export async function extractTextFromImage(imagePath: string): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(imagePath, "hun", {
      logger: () => {},
    });
    return data.text;
  } catch (err) {
    console.error("❌ OCR failed:", err);
    return "";
  }
}
