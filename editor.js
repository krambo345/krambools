const kernel = window.modOS.kernel;
const wer = window.modOS.wer;

let currentWindow = null;
let currentPath = null;
let fieldEl = null;

function parentOf(path) {
  if (!path || path === "/") return "/";
  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
  const idx = trimmed.lastIndexOf("/");
  return idx <= 0 ? "/" : trimmed.slice(0, idx);
}

function baseNameOf(path) {
  if (!path || path === "/") return "";
  const trimmed = path.endsWith("/") ? path.slice(0, -1) : path;
  return trimmed.slice(trimmed.lastIndexOf("/") + 1);
}

function updateTitle() {
  if (!currentWindow) return;
  const label = currentWindow.querySelector(".wer-winl span");
  if (label) {
    label.textContent = currentPath ? `Editor — ${baseNameOf(currentPath)}` : "Editor";
  }
}

async function ensureRangerRunning() {
  if (!window.modOS.ranger || typeof window.modOS.ranger.pick !== "function") {
    await kernel.packer.start("com.krambo345.ranger");
  }
}

async function loadFile(path) {
  const data = kernel.bino.file.read(path);

  if (data === undefined || typeof data !== "string") {
    kernel.system.log("Unable to read file", "error");
    return false;
  }

  if (fieldEl) fieldEl.value = data;
  currentPath = path;
  updateTitle();
  return true;
}

function newFile() {
  if (fieldEl) fieldEl.value = "";
  currentPath = null;
  updateTitle();
}

async function openFileFlow() {
  await ensureRangerRunning();
  const startDir = currentPath ? parentOf(currentPath) : "/";
  const path = await window.modOS.ranger.pick("open", startDir);
  if (path) await loadFile(path);
}

async function saveFile() {
  if (!currentPath) {
    return saveFileAs();
  }

  const result = kernel.bino.file.write(currentPath, fieldEl ? fieldEl.value : "");
  if (result !== true) {
    kernel.system.log("Unable to save file", "error");
    return false;
  }

  kernel.system.log(`Saved ${currentPath}`, "success");
  return true;
}

async function saveFileAs() {
  await ensureRangerRunning();

  const startDir = currentPath ? parentOf(currentPath) : "/";
  const suggested = currentPath ? baseNameOf(currentPath) : "untitled.txt";

  const path = await window.modOS.ranger.pick("save", startDir, suggested);
  if (!path) return false;

  const result = kernel.bino.file.write(path, fieldEl ? fieldEl.value : "");
  if (result !== true) {
    kernel.system.log("Unable to save file", "error");
    return false;
  }

  currentPath = path;
  updateTitle();
  kernel.system.log(`Saved ${path}`, "success");
  return true;
}

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
    newFile();
    fileContent.classList.remove("open");
  });

  fileOptionOpen.addEventListener("click", async () => {
    fileContent.classList.remove("open");
    await openFileFlow();
  });

  fileOptionSave.addEventListener("click", async () => {
    fileContent.classList.remove("open");
    await saveFile();
  });

  fileOptionSaveAs.addEventListener("click", async () => {
    fileContent.classList.remove("open");
    await saveFileAs();
  });

  fileOptionClose.addEventListener("click", () => {
    kill();
    fileContent.classList.remove("open");
  });

  return menuBar;
}

async function editor(win) {
  const field = document.createElement("textarea");
  field.style.resize = "none";
  field.className = "editor-field";
  win.appendChild(field);
  fieldEl = field;
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
  await injectCSS();

  const win = await wer.win("com.krambo345.editor");
  currentWindow = win;

  if (win) {
    await buildWindowMenu(win);
    await editor(win);
    updateTitle();
  }

  return true;
}

export async function kill() {
  if (currentWindow) {
    currentWindow.remove();
    currentWindow = null;
  }

  fieldEl = null;
  currentPath = null;

  return true;
}

export async function commands() {
  return {
    editor: {
      args: "<command>",
      description: "Text editor",
      sub: {
        open: {
          args: "<path>",
          description: "Open a file in the editor",
          run: async ([path]) => {
            if (!currentWindow) {
              await app();
            }
            return await loadFile(path);
          },
        },

        test: {
          args: "<string>",
          description: "Log text to system",
          run: async ([text]) => kernel.system.log(text, "warn"),
        },
      },
    },
  };
}
