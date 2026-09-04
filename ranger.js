const kernel = window.modOS.kernel;
const wer = window.modOS.wer;

const windows = new Set();
const pendingResolvers = new Set();

let activeContextMenu = null;

const iconMap = {
  ase: "aseprite.png",

  c: "file-c.png",
  cpp: "file-cpp.png",
  h: "file-h.png",
  hpp: "file-hpp.png",

  html: "file-html.png",
  htm: "file-html.png",
  xml: "file-xml.png",

  css: "text-css.png",

  js: "script-javascript.png",
  mjs: "script-javascript.png",
  cjs: "script-javascript.png",

  ts: "script-typescript.png",

  lua: "script-lua.png",
  perl: "script-perl.png",
  php: "script-php.png",
  py: "script-python.png",
  qml: "script-qml.png",
  rb: "script-ruby.png",
  tcl: "script-tcl.png",
  ahk: "script-autohotkey.png",
  awk: "script-awk.png",

  cs: "text-csharp.png",
  java: "text-java.png",
  md: "text-markdown.png",

  json: "text-gear.png",
  reg: "file-reg.png",

  txt: "text.png",
  text: "text.png",

  png: "image-png.png",
  jpg: "image-jpeg.png",
  jpeg: "image-jpeg.png",
  gif: "image-gif.png",
  ico: "image-ico.png",
  tga: "image-tga.png",
  tif: "image-tiff.png",
  tiff: "image-tiff.png",
  webp: "image-webp.png",

  mp3: "music.png",
  wav: "sounds.png",
  ogg: "sounds.png",
  flac: "sounds.png",

  mp4: "movies.png",
  webm: "movies.png",
  mov: "movies.png",
  avi: "movies.png",

  otf: "file-font-opentype.png",
  ttf: "file-font-truetype.png",
  woff: "file-font.png",
  woff2: "file-font.png",

  exe: "program.png",
  bin: "bin.png",
};

// --- path helpers -----------------------------------------------------

function joinPath(dir, name) {
  if (dir === "/" || dir === "") return `/${name}`;
  return `${dir.replace(/\/$/, "")}/${name}`;
}

function parentPath(p) {
  if (!p || p === "/") return "/";
  const trimmed = p.endsWith("/") ? p.slice(0, -1) : p;
  const idx = trimmed.lastIndexOf("/");
  return idx <= 0 ? "/" : trimmed.slice(0, idx);
}

function extName(name) {
  return name.includes(".") ? name.split(".").pop().toLowerCase() : "";
}

function isDir(path) {
  try {
    return Array.isArray(kernel.bino.dir.list(path));
  } catch {
    return false;
  }
}

function exists(path) {
  return kernel.bino.file.check(path) === true || isDir(path);
}

function getIcon(name, directory) {
  if (directory) {
    return `${kernel.base}icons/folder.png`;
  }

  const ext = extName(name);
  return `${kernel.base}icons/${iconMap[ext] || "undefined.png"}`;
}

// --- shared css ---------------------------------------------------------

async function injectCSS() {
  if (document.querySelector("style[data-krambools]")) return;

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

// --- talk to the editor package ------------------------------------------

async function openInEditor(path) {
  if (!window.modOS.editor || typeof window.modOS.editor.open !== "function") {
    await kernel.packer.start("com.krambo345.editor");
  }

  if (window.modOS.editor && typeof window.modOS.editor.open === "function") {
    await window.modOS.editor.open(path);
  } else {
    kernel.system.log("Unable to open editor", "error");
  }
}

// --- in-window dialog (no native alert/prompt/confirm) --------------------

function showDialog(win, { title, label, value = "", confirmText = "OK" }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "ranger-dialog-overlay";

    const box = document.createElement("div");
    box.className = "ranger-dialog";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const labelEl = document.createElement("label");
    labelEl.textContent = label;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "ranger-dialog-input";
    input.value = value;

    const buttons = document.createElement("div");
    buttons.className = "ranger-dialog-buttons";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";

    const okBtn = document.createElement("button");
    okBtn.className = "ranger-dialog-ok";
    okBtn.textContent = confirmText;

    buttons.append(cancelBtn, okBtn);
    box.append(heading, labelEl, input, buttons);
    overlay.append(box);

    win.querySelector(".wer-content").appendChild(overlay);

    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      overlay.remove();
      resolve(result);
    };

    okBtn.addEventListener("click", () => finish(input.value.trim()));
    cancelBtn.addEventListener("click", () => finish(null));

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish(input.value.trim());
      if (e.key === "Escape") finish(null);
    });

    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  });
}

// --- right-click context menu --------------------------------------------

function closeContextMenu() {
  if (activeContextMenu) {
    activeContextMenu.remove();
    activeContextMenu = null;
  }
}

function openContextMenu(x, y, items) {
  closeContextMenu();

  const menu = document.createElement("div");
  menu.className = "context-menu";
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const list = document.createElement("ul");

  for (const entry of items) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = entry.label;
    button.disabled = Boolean(entry.disabled);

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      closeContextMenu();
      entry.action();
    });

    li.appendChild(button);
    list.appendChild(li);
  }

  menu.appendChild(list);
  document.body.appendChild(menu);
  activeContextMenu = menu;

  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = `${Math.max(0, window.innerWidth - rect.width - 4)}px`;
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = `${Math.max(0, window.innerHeight - rect.height - 4)}px`;
  }
}

function globalDocumentClick(e) {
  document.querySelectorAll(".ranger-menu-content.open").forEach((el) => {
    if (!el.closest(".ranger-menu-item")?.contains(e.target)) {
      el.classList.remove("open");
    }
  });

  if (activeContextMenu && !activeContextMenu.contains(e.target)) {
    closeContextMenu();
  }
}

document.addEventListener("click", globalDocumentClick);
document.addEventListener("contextmenu", () => closeContextMenu());

// --- explorer / picker window --------------------------------------------

function mkButton(text) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  return button;
}

async function createExplorerWindow(mode = "normal", opts = {}) {
  const win = await wer.win("com.krambo345.ranger");
  if (!win) return mode === "normal" ? null : "";

  windows.add(win);

  const content = win.querySelector(".wer-content");
  content.replaceChildren();

  const state = {
    path: opts.startPath && isDir(opts.startPath) ? opts.startPath : "/",
    history: [],
    historyIndex: -1,
    selectedPath: null,
    selectedName: null,
    selectedIsDir: false,
  };

  let settled = false;
  let resolvePick = null;

  const pickerPromise =
    mode === "normal"
      ? null
      : new Promise((resolve) => {
          resolvePick = (value) => {
            resolve(value);
            pendingResolvers.delete(resolvePick);
          };
          pendingResolvers.add(resolvePick);
        });

  function closeWindow() {
    if (settled) return;
    settled = true;
    windows.delete(win);
    win.remove();
    resolvePick?.("");
  }

  function finishPicker(value) {
    if (settled) return;
    settled = true;
    windows.delete(win);
    win.remove();
    resolvePick?.(value);
  }

  // -- file menu --

  const menuBar = document.createElement("div");
  menuBar.className = "ranger-menu";

  const fileMenu = document.createElement("div");
  fileMenu.className = "ranger-menu-item";

  const fileBtn = document.createElement("button");
  fileBtn.className = "ranger-menu-button";
  fileBtn.textContent = "File";

  const fileContent = document.createElement("div");
  fileContent.className = "ranger-menu-content";

  const newFileOpt = mkButton("New File");
  newFileOpt.className = "ranger-menu-option";

  const newFolderOpt = mkButton("New Folder");
  newFolderOpt.className = "ranger-menu-option";

  const refreshOpt = mkButton("Refresh");
  refreshOpt.className = "ranger-menu-option";

  const closeOpt = mkButton("Close");
  closeOpt.className = "ranger-menu-option";

  fileContent.append(newFileOpt, newFolderOpt, refreshOpt, closeOpt);
  fileMenu.append(fileBtn, fileContent);
  menuBar.appendChild(fileMenu);

  fileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileContent.classList.toggle("open");
  });

  // -- layout --

  const root = document.createElement("div");
  root.className = "ranger";

  const toolbar = document.createElement("div");
  toolbar.className = "ranger-toolbar";

  const backBtn = mkButton("<");
  const forwardBtn = mkButton(">");
  const upBtn = mkButton("^");

  const pathLabel = document.createElement("div");
  pathLabel.className = "ranger-path";

  toolbar.append(backBtn, forwardBtn, upBtn, pathLabel);

  const list = document.createElement("div");
  list.className = "ranger-list";

  root.append(toolbar, list);

  let footer = null;
  let filenameInput = null;
  let selectBtn = null;
  let cancelBtn = null;

  if (mode === "pick-open" || mode === "pick-save") {
    footer = document.createElement("div");
    footer.className = "ranger-picker-bar";

    if (mode === "pick-save") {
      filenameInput = document.createElement("input");
      filenameInput.type = "text";
      filenameInput.className = "ranger-picker-input";
      filenameInput.value = opts.suggestedName || "untitled.txt";
      footer.appendChild(filenameInput);
    }

    cancelBtn = mkButton("Cancel");
    selectBtn = mkButton(mode === "pick-save" ? "Save" : "Select");

    footer.append(cancelBtn, selectBtn);
    root.appendChild(footer);
  }

  content.append(menuBar, root);

  // -- actions --

  async function render(path) {
    list.replaceChildren();
    pathLabel.textContent = path;
    pathLabel.title = path;
    state.path = path;

    let entries = [];
    try {
      const result = kernel.bino.dir.list(path);
      if (Array.isArray(result)) entries = result;
    } catch (error) {
      kernel.system.log(String(error), "error");
    }

    entries = entries
      .map(String)
      .sort((a, b) => {
        const ad = isDir(joinPath(path, a));
        const bd = isDir(joinPath(path, b));
        if (ad !== bd) return ad ? -1 : 1;
        return a.localeCompare(b);
      });

    for (const name of entries) {
      const full = joinPath(path, name);
      const dir = isDir(full);

      const item = document.createElement("button");
      item.type = "button";
      item.className = "ranger-item";

      const img = document.createElement("img");
      img.className = "ranger-icon";
      img.src = getIcon(name, dir);
      img.alt = "";

      const label = document.createElement("span");
      label.className = "ranger-name";
      label.textContent = name;

      item.append(img, label);
      list.appendChild(item);

      item.addEventListener("click", () => selectItem(full, name, dir, item));

      item.addEventListener("dblclick", async () => {
        if (dir) {
          await navigate(full);
          return;
        }

        if (mode === "pick-open") {
          finishPicker(full);
        } else if (mode === "pick-save") {
          filenameInput.value = name;
        } else {
          await openInEditor(full);
        }
      });

      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectItem(full, name, dir, item);
        showItemContextMenu(e.clientX, e.clientY, full, name, dir);
      });
    }

    updateNavButtons();
  }

  function selectItem(full, name, dir, itemEl) {
    for (const child of list.children) child.classList.remove("selected");
    itemEl?.classList.add("selected");

    state.selectedPath = full;
    state.selectedName = name;
    state.selectedIsDir = dir;

    if (mode === "pick-save" && !dir) {
      filenameInput.value = name;
    }

    updatePickerButton();
  }

  function updateNavButtons() {
    backBtn.disabled = state.historyIndex <= 0;
    forwardBtn.disabled = state.historyIndex >= state.history.length - 1;
  }

  function updatePickerButton() {
    if (!selectBtn) return;
    if (mode === "pick-open") {
      selectBtn.disabled = !state.selectedPath || state.selectedIsDir;
    }
  }

  async function navigate(path, pushHistory = true) {
    if (!isDir(path)) {
      kernel.system.log("Path not found", "error");
      return;
    }

    if (pushHistory) {
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(path);
      state.historyIndex++;
    }

    state.selectedPath = null;
    state.selectedName = null;
    state.selectedIsDir = false;
    updatePickerButton();

    await render(path);
  }

  async function createFile() {
    const name = await showDialog(win, {
      title: "New File",
      label: "File name",
      value: "untitled.txt",
      confirmText: "Create",
    });
    if (!name) return;

    const path = joinPath(state.path, name);
    if (exists(path)) {
      kernel.system.log("A file or folder with that name already exists", "error");
      return;
    }

    if (kernel.bino.file.write(path, "") !== true) {
      kernel.system.log("Unable to create file", "error");
      return;
    }

    await render(state.path);
  }

  async function createFolder() {
    const name = await showDialog(win, {
      title: "New Folder",
      label: "Folder name",
      value: "New Folder",
      confirmText: "Create",
    });
    if (!name) return;

    const path = joinPath(state.path, name);
    if (exists(path)) {
      kernel.system.log("A file or folder with that name already exists", "error");
      return;
    }

    kernel.bino.dir.make(path);
    await render(state.path);
  }

  async function renamePath(full, name, dir) {
    const newName = await showDialog(win, {
      title: "Rename",
      label: dir ? "Folder name" : "File name",
      value: name,
      confirmText: "Rename",
    });
    if (!newName || newName === name) return;

    const target = joinPath(parentPath(full), newName);
    if (exists(target)) {
      kernel.system.log("A file or folder with that name already exists", "error");
      return;
    }

    const renamed = dir
      ? kernel.bino.dir.rename(full, target)
      : kernel.bino.file.rename(full, target);

    if (renamed !== true) {
      kernel.system.log("Unable to rename", "error");
      return;
    }

    await render(state.path);
  }

  function showEmptyContextMenu(x, y) {
    openContextMenu(x, y, [
      { label: "New File", action: () => createFile() },
      { label: "New Folder", action: () => createFolder() },
    ]);
  }

  function showItemContextMenu(x, y, full, name, dir) {
    const items = [];

    if (!dir) {
      items.push({ label: "Edit", action: () => openInEditor(full) });
    }

    items.push({ label: "Rename", action: () => renamePath(full, name, dir) });

    openContextMenu(x, y, items);
  }

  // -- wire toolbar / menu --

  backBtn.addEventListener("click", async () => {
    if (state.historyIndex <= 0) return;
    state.historyIndex--;
    await render(state.history[state.historyIndex]);
    updateNavButtons();
  });

  forwardBtn.addEventListener("click", async () => {
    if (state.historyIndex >= state.history.length - 1) return;
    state.historyIndex++;
    await render(state.history[state.historyIndex]);
    updateNavButtons();
  });

  upBtn.addEventListener("click", () => navigate(parentPath(state.path)));

  list.addEventListener("contextmenu", (e) => {
    if (e.target !== list) return;
    e.preventDefault();
    showEmptyContextMenu(e.clientX, e.clientY);
  });

  newFileOpt.addEventListener("click", () => {
    fileContent.classList.remove("open");
    createFile();
  });

  newFolderOpt.addEventListener("click", () => {
    fileContent.classList.remove("open");
    createFolder();
  });

  refreshOpt.addEventListener("click", () => {
    fileContent.classList.remove("open");
    render(state.path);
  });

  closeOpt.addEventListener("click", () => {
    fileContent.classList.remove("open");
    closeWindow();
  });

  win.querySelector(".wer-closewin")?.addEventListener("click", () => {
    windows.delete(win);
    if (mode !== "normal") finishPicker("");
  });

  if (selectBtn) {
    selectBtn.addEventListener("click", () => {
      if (mode === "pick-open") {
        if (state.selectedPath && !state.selectedIsDir) {
          finishPicker(state.selectedPath);
        }
      } else if (mode === "pick-save") {
        const name = filenameInput.value.trim();
        if (!name) {
          kernel.system.log("Enter a file name", "warn");
          return;
        }
        finishPicker(joinPath(state.path, name));
      }
    });
  }

  cancelBtn?.addEventListener("click", () => finishPicker(""));

  await navigate(state.path);

  if (mode === "normal") {
    return win;
  }

  return await pickerPromise;
}

// --- package lifecycle -----------------------------------------------------

export async function app() {
  await injectCSS();
  await createExplorerWindow("normal", { startPath: "/" });
  return true;
}

export async function kill() {
  for (const win of windows) {
    win.remove();
  }
  windows.clear();

  for (const resolve of pendingResolvers) {
    resolve("");
  }
  pendingResolvers.clear();

  closeContextMenu();
  document.removeEventListener("click", globalDocumentClick);

  return true;
}

export function commands() {
  return {
    ranger: {
      args: "<command>",
      description: "File explorer",
      sub: {
        open: {
          args: "[path]",
          description: "Open a directory browser window",
          run: async ([path]) => {
            await injectCSS();
            const win = await createExplorerWindow("normal", { startPath: path || "/" });
            return Boolean(win);
          },
        },

        pick: {
          args: "<open|save> [path] [filename]",
          description:
            "Open a picker window; navigate and select a folder/file, returns the chosen path as plain text (empty string if cancelled)",
          run: async ([kind, path, filename]) => {
            await injectCSS();
            const mode = kind === "save" ? "pick-save" : "pick-open";
            return await createExplorerWindow(mode, {
              startPath: path || "/",
              suggestedName: filename,
            });
          },
        },
      },
    },
  };
}
