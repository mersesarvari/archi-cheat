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
2. For each question, find the most relevant answer using the PDF text if available.
3. Provide answers that are as **short and concise as possible** (preferably one sentence or a few words).
4. Return a JSON array where each element has the structure:
[
  {
    "question": "<the question text>",
    "answer": "<the short answer text>"
  }
]
5. If no questions are found, return: null

**Return only valid JSON. Do not include explanations, extra text, or formatting.**
`;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // Extract text from Gemini response safely
  const candidate = response?.candidates?.[0];
  let outputText = "";
  if (candidate?.content?.parts) {
    outputText = candidate.content.parts.map((p: any) => p.text).join("\n");
  }

  // Optional: parse JSON to ensure it's valid
  try {
    const parsed = JSON.parse(outputText);
    return JSON.stringify(parsed, null, 2); // formatted JSON string
  } catch {
    console.warn("⚠️ Gemini did not return valid JSON. Returning raw text.");
    return outputText;
  }
}
