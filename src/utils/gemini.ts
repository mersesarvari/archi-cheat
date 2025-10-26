// src/utils/gemini.ts
import fs from "fs";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";

/**
 * Extract text from PDF (optional)
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) return "";
  const dataBuffer = fs.readFileSync(filePath);
  const parsed = await (pdfParse as any)(dataBuffer);
  return parsed.text;
}

/**
 * Send text (and optional PDF) to Gemini and log the output
 * @param apiKey Your Gemini API key
 * @param textInput Text extracted from webpage/screenshot
 * @param pdfFilePath Optional PDF for context
 */
export async function sendTextToGemini(
  apiKey: string,
  textInput: string,
  pdfFilePath?: string
): Promise<string> {
  const client = new GoogleGenAI({ apiKey });

  let pdfText = "";
  if (pdfFilePath) {
    console.log(`📄 Extracting text from PDF: ${pdfFilePath}`);
    pdfText = await extractTextFromPDF(pdfFilePath);
  }

  const prompt = `
You are an AI assistant.

Input text:
---
${textInput}
---

${
  pdfText
    ? `Reference PDF text:
---
${pdfText}
---
Use the PDF text to answer questions.`
    : "No PDF context provided; answer based on your knowledge."
}

Task:
1. Identify any questions in the input text.
2. Answer each question (use PDF text if available).
3. Return your answer as text.
`;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // Safely extract the text from Gemini response
  const candidate = response?.candidates?.[0];
  let outputText = "";
  if (candidate?.content?.parts) {
    outputText = candidate.content.parts.map((p: any) => p.text).join("\n");
  }

  //console.log("💡 Gemini output:\n", outputText);
  return outputText;
}
