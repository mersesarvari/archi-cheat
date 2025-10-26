// src/utils/ui-helper.ts

/**
 * Show Gemini response in a modal on the page
 * @param page - Patchright Page instance
 * @param text - Text to show
 */
export async function showGeminiModal(page: any, text: string) {
  await page.evaluate((respText: string) => {
    // Remove existing modal
    const existing = document.getElementById("gemini-modal");
    if (existing) existing.remove();

    // Overlay
    const overlay = document.createElement("div");
    overlay.id = "gemini-modal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "10000";

    // Modal box
    const box = document.createElement("div");
    box.style.background = "#fff";
    box.style.padding = "20px";
    box.style.borderRadius = "8px";
    box.style.maxWidth = "80%";
    box.style.maxHeight = "80%";
    box.style.overflowY = "auto";
    box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.marginBottom = "10px";
    closeBtn.onclick = () => overlay.remove();

    // Content
    const contentEl = document.createElement("pre");
    contentEl.textContent = respText;
    contentEl.style.whiteSpace = "pre-wrap";

    box.appendChild(closeBtn);
    box.appendChild(contentEl);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }, text);
}

/**
 * Inject a button into the page
 * @param page - Patchright Page instance
 * @param id - Button ID
 * @param text - Button text
 * @param onClickFunctionName - Name of the exposed function on window to call
 * @param position - {top,left} in pixels
 */
export async function injectButton(
  page: any,
  id: string,
  text: string,
  onClickFunctionName: string,
  position: { top: number; left: number } = { top: 10, left: 10 }
) {
  await page.waitForSelector("body");

  const buttonExists = await page.$(`#${id}`);
  if (buttonExists) return;

  await page.evaluate(
    ({
      id,
      text,
      onClickFunctionName,
      top,
      left,
    }: {
      id: string;
      text: string;
      onClickFunctionName: string;
      top: number;
      left: number;
    }) => {
      const btn = document.createElement("button");
      btn.id = id;
      btn.textContent = text;
      btn.style.position = "fixed";
      btn.style.top = `${top}px`;
      btn.style.left = `${left}px`;
      btn.style.zIndex = "9999";
      btn.style.padding = "8px 12px";
      btn.style.background = "#1d294d";
      btn.style.color = "#fff";
      btn.style.border = "none";
      btn.style.borderRadius = "4px";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "14px";

      btn.onclick = async () => {
        const result = await (window as any)[onClickFunctionName]();
        console.log("🖋️ Action executed, result:", result);
      };

      document.body.appendChild(btn);
    },
    { id, text, onClickFunctionName, top: position.top, left: position.left }
  );

  console.log(`✅ Button '${text}' injected at top-left.`);
}
