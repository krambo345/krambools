const kernel = window.modOS.kernel;
const wer = window.modOS.wer;

const path = "/"
async function rightMenu() {
  const menuSelected = document.createElement("div");
  menuSelected.id = "contextMenu";
  menuSelected.className = "context-menu";
  menuSelected.style.display = "none";

  const selectedList = document.createElement("ul");

  const editItem = document.createElement("li");
  const editButton = document.createElement("button");
  editButton.textContent = "Edit";

  const renameItem = document.createElement("li");
  const renameButton = document.createElement("button");
  renameButton.textContent = "Rename";

  editItem.appendChild(editButton);
  renameItem.appendChild(renameButton);

  selectedList.appendChild(editItem);
  selectedList.appendChild(renameItem);

  menuSelected.appendChild(selectedList);

  const emptyList = document.createElement("ul");

  const newFileButton = document.createElement("button");
  newFileButton.textContent = "New File";

  const newFileItem = document.createElement("li");
  newFileItem.appendChild(newFileButton);

  const newFolderButton = document.createElement("button");
  newFolderButton.textContent = "New Folder";

  const newFolderItem = document.createElement("li");
  newFolderItem.appendChild(newFolderButton);

  emptyList.appendChild(newFileItem);
  emptyList.appendChild(newFolderItem);

  menuEmpty.appendChild(emptyList);

  return {
    menuSelected,
    menuEmpty
  };
}
function getIcon(name, isDirectory) {
  if (isDirectory) {
    return `${kernel.base}icons/folder.png`;
  }

  const ext = name.includes(".")
    ? name.split(".").pop().toLowerCase()
    : "";

  const icons = {
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

  return `${kernel.base}icons/${icons[ext] || "undefined.png"}`;
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

  menuBar.className = "ranger-menu";
  fileMenu.className = "ranger-menu-item";
  file.className = "ranger-menu-button";
  fileContent.className = "ranger-menu-content";

  fileOptionNew.className = "ranger-menu-option";
  fileOptionOpen.className = "ranger-menu-option";
  fileOptionSave.className = "ranger-menu-option";
  fileOptionSaveAs.className = "ranger-menu-option";
  fileOptionClose.className = "ranger-menu-option";

  file.textContent = "File";
  fileOptionNew.textContent = "New File";
  fileOptionOpen.textContent = "New Folder";
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

  fileOptionClose.addEventListener("click", () => {
    kill(win);
    fileContent.classList.remove("open");
  });

  return menuBar;
}

export async function app() {
  wer.win
}

export async function kill() {
  rangerWindow = null;
  return true;
}

export function commands() {
  return {
    ranger: {
      args: "<command>",
      description: "File explorer",
      sub: {
        open: {
          args: "<path>",
          description: "Open a directory",
          run: async ([path]) => {
            if (!rangerWindow) {
              await app();
            }

            history = [];
            await renderDirectory(path || "/");

            return true;
          },
        },
      },
    },
  };
}