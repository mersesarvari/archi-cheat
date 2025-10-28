import { Page } from "patchright";

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

    // Close modal on background click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Close modal with ESC key
    const escHandler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

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

/**
 * Injects a toggle button next to the screenshot button to show/hide the modal
 */
export async function injectToggleModalButton(page: any) {
  await page.waitForSelector("body");

  const toggleBtnExists = await page.$("#toggle-modal-btn");
  if (toggleBtnExists) return;

  await page.evaluate(() => {
    const existing = document.getElementById("screenshot-btn");
    if (!existing) return;

    const btn = document.createElement("button");
    btn.id = "toggle-modal-btn";
    btn.textContent = "Toggle Modal";
    btn.style.position = "fixed";
    btn.style.top = "10px";
    btn.style.left = "140px";
    btn.style.zIndex = "9999";
    btn.style.padding = "8px 12px";
    btn.style.background = "#1d294d";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";

    btn.onclick = () => {
      const modal = document.getElementById("gemini-modal");
      if (modal) {
        modal.remove();
        return;
      }

      // --- Create modal (always includes Close button) ---
      const storedText =
        (window as any).__lastGeminiText || "No modal content yet.";

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

      const box = document.createElement("div");
      box.style.background = "#fff";
      box.style.padding = "20px";
      box.style.borderRadius = "8px";
      box.style.maxWidth = "80%";
      box.style.maxHeight = "80%";
      box.style.overflowY = "auto";
      box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

      // Close button (always present)
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.marginBottom = "10px";
      closeBtn.onclick = () => overlay.remove();

      // Close modal on background click
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
      });

      // Close modal with ESC key
      const escHandler = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") {
          overlay.remove();
          document.removeEventListener("keydown", escHandler);
        }
      };
      document.addEventListener("keydown", escHandler);

      const contentEl = document.createElement("pre");
      contentEl.textContent = storedText;
      contentEl.style.whiteSpace = "pre-wrap";

      box.appendChild(closeBtn);
      box.appendChild(contentEl);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    };

    document.body.appendChild(btn);
  });

  console.log("✅ Toggle Modal button injected next to Screenshot button.");
}

export async function injectAutoFillShortcut(page: Page) {
  await page.evaluate(() => {
    document.addEventListener("keydown", async (e) => {
      // Ctrl + O pressed
      console.log("CTRL+O pressed");
      if (e.ctrlKey && e.key.toLowerCase() === "o") {
        e.preventDefault();

        try {
          const raw = (window as any).__lastGeminiText;
          if (!raw) {
            alert("⚠️ No Gemini response found yet!");
            return;
          }

          // Clean and parse JSON
          const cleaned = raw.replace(/```(?:json)?/g, "").trim();
          const data = JSON.parse(cleaned);

          if (!Array.isArray(data)) {
            alert("⚠️ Gemini data is not in expected format.");
            return;
          }

          // Find all text input fields and textareas
          const fields = Array.from(
            document.querySelectorAll("input[type='text'], textarea")
          ) as HTMLInputElement[];

          if (fields.length === 0) {
            alert("⚠️ No input fields found on this page.");
            return;
          }

          // Fill each field with corresponding answer
          data.forEach((qa, index) => {
            if (fields[index]) {
              fields[index].value = qa.answer ?? "";
              // trigger input events if needed for React/Vue/etc
              fields[index].dispatchEvent(
                new Event("input", { bubbles: true })
              );
            }
          });

          alert(`✅ Filled ${Math.min(data.length, fields.length)} fields!`);
        } catch (err) {
          console.error("❌ Failed to fill inputs:", err);
          alert("❌ Error parsing Gemini response or filling fields.");
        }
      }
    });
  });
}
