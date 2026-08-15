const kernel = window.modOS.kernel;
const wer = window.modOS.wer;
const display = document.querySelector(".display");

async function buildWindowMenu(win) {
  const menuBar = document.createElement("div");
  const fileMenu = document.createElement("div");
  const file = document.createElement("button");
  const fileContent = document.createElement("div");

  const fileOptionNew = document.createElement("button");
  const fileOptionOpen = document.createElement("button");
  const fileOptionSave = document.createElement("button");
  const fileOptionSaveAs = document.createElement("button");
  const fileOptionClose = document.createElement("button");

  menuBar.className = "editor-menu";
  fileMenu.className = "editor-menu-item";
  file.className = "editor-menu-button";
  fileContent.className = "editor-menu-content";

  fileOptionNew.className = "editor-menu-option";
  fileOptionOpen.className = "editor-menu-option";
  fileOptionSave.className = "editor-menu-option";
  fileOptionSaveAs.className = "editor-menu-option";
  fileOptionClose.className = "editor-menu-option";

  file.textContent = "File";
  fileOptionNew.textContent = "New";
  fileOptionOpen.textContent = "Open";
  fileOptionSave.textContent = "Save";
  fileOptionSaveAs.textContent = "Save As";
  fileOptionClose.textContent = "Close";

  fileContent.appendChild(fileOptionNew);
  fileContent.appendChild(fileOptionOpen);
  fileContent.appendChild(fileOptionSave);
  fileContent.appendChild(fileOptionSaveAs);
  fileContent.appendChild(fileOptionClose);

  fileMenu.appendChild(file);
  fileMenu.appendChild(fileContent);
  menuBar.appendChild(fileMenu);

  win.querySelector(".wer-content").appendChild(menuBar);

  file.addEventListener("click", () => {
    fileContent.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (!fileMenu.contains(event.target)) {
      fileContent.classList.remove("open");
    }
  });

  fileOptionNew.addEventListener("click", () => {
    kernel.system.log("New file", "info");
    fileContent.classList.remove("open");
  });

  fileOptionOpen.addEventListener("click", () => {
    kernel.system.log("Open file", "info");
    fileContent.classList.remove("open");
  });

  fileOptionSave.addEventListener("click", () => {
    kernel.system.log("Save file", "info");
    fileContent.classList.remove("open");
  });

  fileOptionSaveAs.addEventListener("click", () => {
    kernel.system.log("Save As", "info");
    fileContent.classList.remove("open");
  });

  fileOptionClose.addEventListener("click", () => {
    kill(win);
    fileContent.classList.remove("open");
  });

  return menuBar;
}
async function editor(win){
    const field = document.createElement("textarea");
    field.style.resize = "none";
    field.className = "editor-field"
    win.appendChild(field)
}
async function injectCSS() {
  if (document.querySelector('style[data-krambools]')) return;

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/krambo345/krambools/refs/heads/master/krambools.css"
    );
    const css = await response.text();
    const style = document.createElement("style");
    style.dataset.krambools = "true";
    style.textContent = css;
    document.head.appendChild(style);
  } catch (error) {
    kernel.system.log(`Failed to inject CSS: ${error}`, "error");
  }
}

export async function app() {
  const win = await wer.win("com.krambo345.ranger");

  if (win) {
    await buildWindowMenu(win);
    await editor(win);
  }

  return true;
}

export async function kill(win) {
  win.remove();
  return true;
}

export async function commands() {
  return {
    editor: {
      args: "<arg>",
      description: "Text editor",
      sub: {
        test: {
          args: "<string>",
          description: "Log text to system",
          run: async ([text]) =>
            kernel.system.log(text, "warn")
        }
      }
    }
  };
}