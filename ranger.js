const kernel = window.modOS.kernel;
const wer = window.modOS.wer;

const windows = new Set();
const pickers = new Set();

const iconMap = {
  js: "script-javascript.png", mjs: "script-javascript.png", cjs: "script-javascript.png",
  ts: "script-typescript.png", html: "file-html.png", htm: "file-html.png", css: "text-css.png",
  json: "text-gear.png", md: "text-markdown.png", txt: "text.png", text: "text.png",
  png: "image-png.png", jpg: "image-jpeg.png", jpeg: "image-jpeg.png", gif: "image-gif.png",
  webp: "image-webp.png", mp3: "music.png", wav: "sounds.png", ogg: "sounds.png",
  mp4: "movies.png", webm: "movies.png", mov: "movies.png", otf: "file-font-opentype.png",
  ttf: "file-font-truetype.png", exe: "program.png", bin: "bin.png"
};

const join = (a, b) => a === "/" ? `/${b}` : `${a.replace(/\/$/, "")}/${b}`;
const parent = p => !p || p === "/" ? "/" : ((p = p.replace(/\/$/, "")).slice(0, p.lastIndexOf("/")) || "/");
const base = p => p === "/" ? "/" : p.split("/").pop();
const ext = p => base(p).includes(".") ? base(p).split(".").pop().toLowerCase() : "";
const isDir = p => Array.isArray(kernel.bino.dir.list(p));
const exists = p => kernel.bino.file.check(p) || isDir(p);
const icon = (name, dir) => `${kernel.base}icons/${dir ? "folder.png" : (iconMap[ext(name)] || "undefined.png")}`;

function allowed(path, tags) {
  if (!tags.length || tags.includes("all")) return true;
  const dir = isDir(path);
  if (tags.includes("folder") || tags.includes("directory")) return dir;
  if (tags.includes("file")) return !dir;
  const groups = {
    image: ["png","jpg","jpeg","gif","webp","ico","tga","tif","tiff"],
    audio: ["mp3","wav","ogg","flac"],
    video: ["mp4","webm","mov","avi"],
    text: ["txt","text","md","json","xml","html","css","js","mjs","ts"]
  };
  return tags.some(t => t === ext(path) || (groups[t] || []).includes(ext(path)));
}

function parseTags(args) {
  const tags = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tags") {
      tags.push(...String(args[++i] || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean));
    }
  }
  return tags;
}

function input(title, value = "") {
  return new Promise(resolve => {
    const name = prompt(title, value);
    resolve(name === null ? null : name.trim());
  });
}

async function explorer(start = "/", picker = null) {
  const win = await wer.win("com.krambo345.ranger");
  if (!win) return null;

  windows.add(win);

  const content = win.querySelector(".wer-content");
  const state = {
    path: start || "/",
    selected: null,
    selectedName: null,
    history: [],
    historyIndex: -1,
    editing: null,
    editingPath: null
  };

  const toolbar = document.createElement("div");
  toolbar.className = "ranger-toolbar";

  const back = document.createElement("button");
  back.textContent = "Back";

  const forward = document.createElement("button");
  forward.textContent = "Forward";

  const up = document.createElement("button");
  up.textContent = "Up";

  const location = document.createElement("input");
  location.className = "ranger-location";

  const go = document.createElement("button");
  go.textContent = "Go";

  const newFile = document.createElement("button");
  newFile.textContent = "New File";

  const newFolder = document.createElement("button");
  newFolder.textContent = "New Folder";

  const edit = document.createElement("button");
  edit.textContent = "Edit";

  const save = document.createElement("button");
  save.textContent = "Save";

  const saveAs = document.createElement("button");
  saveAs.textContent = "Save As";

  const rename = document.createElement("button");
  rename.textContent = "Rename";

  const refresh = document.createElement("button");
  refresh.textContent = "Refresh";

  toolbar.append(back, forward, up, location, go, newFile, newFolder, edit, save, saveAs, rename, refresh);

  const list = document.createElement("div");
  list.className = "ranger-files";

  const status = document.createElement("div");
  status.className = "ranger-status";

  content.replaceChildren(toolbar, list, status);

  const close = () => {
    if (picker) {
      picker.resolve("");
      pickers.delete(picker);
    }
    windows.delete(win);
    win.remove();
  };

  const finish = value => {
    if (!picker) return;
    picker.resolve(value);
    pickers.delete(picker);
    windows.delete(win);
    win.remove();
  };

  const updateButtons = () => {
    const selected = state.selected;
    const canEdit = selected && !isDir(selected);
    const canRename = !!selected;
    edit.disabled = !canEdit;
    save.disabled = !state.editing;
    saveAs.disabled = !state.editing;
    rename.disabled = !canRename;
    back.disabled = state.historyIndex <= 0;
    forward.disabled = state.historyIndex >= state.history.length - 1;
  };

  const navigate = async (path, addHistory = true) => {
    if (!isDir(path)) {
      kernel.system.log("Path not found", "error");
      return;
    }

    if (addHistory) {
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push(path);
      state.historyIndex++;
    }

    state.path = path;
    state.selected = null;
    state.selectedName = null;
    await render(path);
  };

  const render = async path => {
    try {
      if (!isDir(path)) throw new Error("Not a directory");

      state.path = path;
      location.value = path;
      state.selected = null;
      state.selectedName = null;
      list.replaceChildren();

      const entries = Array.from(kernel.bino.dir.list(path) || [])
      .map(String)
      .sort((a, b) => {
        const ad = isDir(join(path, a));
        const bd = isDir(join(path, b));
        if (ad !== bd) return ad ? -1 : 1;
        return a.localeCompare(b);
      });

      for (const name of entries) {
        const full = join(path, name);
        const dir = isDir(full);
        const item = document.createElement("button");
        item.className = "ranger-file";

        const img = document.createElement("img");
        img.src = icon(name, dir);
        img.alt = "";

        const label = document.createElement("span");
        label.textContent = name;

        item.append(img, label);
        list.append(item);

        if (picker && !allowed(full, picker.tags)) {
          item.disabled = true;
        }

        item.onclick = () => {
          state.selected = full;
          state.selectedName = name;
          state.editing = null;
          state.editingPath = null;

          for (const child of list.children) {
            child.classList.remove("selected");
          }

          item.classList.add("selected");
          status.textContent = full;
          updateButtons();
        };

        item.ondblclick = async () => {
          if (picker && !allowed(full, picker.tags)) return;

          if (dir) {
            await navigate(full);
          } else if (picker) {
            finish(full);
          } else {
            await openFile(full);
          }
        };
      }

      status.textContent = `${entries.length} item${entries.length === 1 ? "" : "s"}`;
      updateButtons();
    } catch (e) {
      kernel.system.log(String(e), "error");
    }
  };

  const openFile = async path => {
    if (isDir(path)) {
      await navigate(path);
      return;
    }

    const data = kernel.bino.file.read(path);

    if (data === undefined) {
      kernel.system.log("Unable to read file", "error");
      return;
    }

    state.selected = path;
    state.selectedName = base(path);
    state.editing = String(data);
    state.editingPath = path;

    await showEditor(path, String(data));
  };

  const showEditor = async (path, data) => {
    list.replaceChildren();

    const editor = document.createElement("textarea");
    editor.className = "ranger-editor";
    editor.value = data;
    editor.spellcheck = false;

    list.append(editor);

    state.editing = editor;
    state.editingPath = path;

    status.textContent = path;
    updateButtons();

    editor.focus();
  };

  const saveFile = async () => {
    if (!state.editing || !state.editingPath) return false;

    const data = state.editing.value;
    const result = kernel.bino.file.write(state.editingPath, data);

    if (result !== true) {
      kernel.system.log("Unable to save file", "error");
      return false;
    }

    state.selected = state.editingPath;
    state.selectedName = base(state.editingPath);
    await render(state.path);
    return true;
  };

  const saveFileAs = async () => {
    if (!state.editing) return false;

    const name = await input("Save as:", state.selectedName || "untitled.txt");
    if (!name) return false;

    const path = join(state.path, name);
    const result = kernel.bino.file.write(path, state.editing.value);

    if (result !== true) {
      kernel.system.log("Unable to save file", "error");
      return false;
    }

    state.selected = path;
    state.selectedName = name;
    state.editingPath = path;
    await render(state.path);
    return true;
  };

  const createFile = async () => {
    const name = await input("File name:");
    if (!name) return;

    const path = join(state.path, name);

    if (exists(path)) {
      kernel.system.log("File already exists", "error");
      return;
    }

    if (kernel.bino.file.write(path, "") !== true) {
      kernel.system.log("Unable to create file", "error");
      return;
    }

    await render(state.path);
  };

  const createFolder = async () => {
    const name = await input("Folder name:");
    if (!name) return;

    const path = join(state.path, name);

    if (exists(path)) {
      kernel.system.log("Folder already exists", "error");
      return;
    }

    kernel.bino.dir.make(path);
    await render(state.path);
  };

  const renameSelected = async () => {
    if (!state.selected) return;

    const name = await input("Rename:", state.selectedName);
    if (!name || name === state.selectedName) return;

    const target = join(state.path, name);

    if (exists(target)) {
      kernel.system.log("A file or folder with that name already exists", "error");
      return;
    }

    const data = isDir(state.selected) ? null : kernel.bino.file.read(state.selected);

    if (data !== null && data !== undefined) {
      if (kernel.bino.file.write(target, data) !== true) {
        kernel.system.log("Unable to rename file", "error");
        return;
      }
      kernel.bino.file.delete(state.selected);
    } else {
      kernel.bino.dir.make(target);
      kernel.bino.dir.delete(state.selected);
    }

    state.selected = null;
    state.selectedName = null;
    await render(state.path);
  };

  back.onclick = async () => {
    if (state.historyIndex <= 0) return;
    state.historyIndex--;
    await render(state.history[state.historyIndex]);
  };

  forward.onclick = async () => {
    if (state.historyIndex >= state.history.length - 1) return;
    state.historyIndex++;
    await render(state.history[state.historyIndex]);
  };

  up.onclick = () => navigate(parent(state.path));

  go.onclick = () => navigate(location.value.trim() || "/");

  location.onkeydown = e => {
    if (e.key === "Enter") navigate(location.value.trim() || "/");
  };

    newFile.onclick = createFile;
    newFolder.onclick = createFolder;

    edit.onclick = async () => {
      if (state.selected) await openFile(state.selected);
    };

      save.onclick = saveFile;
      saveAs.onclick = saveFileAs;
      rename.onclick = renameSelected;

      refresh.onclick = () => render(state.path);

      await navigate(state.path);

      return win;
}

export async function app() {
  await explorer("/");
  return true;
}

export async function kill() {
  for (const win of windows) {
    win.remove();
  }

  windows.clear();

  for (const picker of pickers) {
    picker.resolve("");
  }

  pickers.clear();
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
          description: "Open a directory",
          run: async ([path] = []) => {
            await explorer(path || "/");
            return true;
          }
        },
        pick: {
          args: "[--tags <tags>]",
          description: "Pick a file or folder and return its path",
          run: async (args = []) => {
            const tags = parseTags(args);

            return new Promise(resolve => {
              const picker = { tags, resolve };
              pickers.add(picker);
              explorer("/", picker);
            });
          }
        }
      }
    }
  };
}
