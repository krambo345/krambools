const kernel = window.modOS.kernel;
const wer = window.modOS.wer;

let rangerWindow = null;
let currentPath = "/";
let history = [];

function joinPath(base, name) {
  if (base === "/") return `/${name}`;
  return `${base.replace(/\/$/, "")}/${name}`;
}

function parentPath(path) {
  if (path === "/" || !path) return "/";
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return parts.length ? `/${parts.join("/")}` : "/";
}

function getIcon(name, isDirectory) {
  if (isDirectory) return "📁";

  const ext = name.includes(".")
    ? name.split(".").pop().toLowerCase()
    : "";

  const icons = {
    js: "📜",
    ts: "📜",
    html: "🌐",
    css: "🎨",
    json: "⚙️",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    gif: "🖼️",
    svg: "🖼️",
    mp3: "🎵",
    wav: "🎵",
    mp4: "🎬",
    txt: "📄",
    md: "📝",
  };

  return icons[ext] || "📄";
}

async function renderDirectory(path) {
  currentPath = path;

  const content = rangerWindow?.querySelector(".wer-content");
  if (!content) return;

  const list = content.querySelector(".ranger-list");
  const pathDisplay = content.querySelector(".ranger-path");

  pathDisplay.textContent = path;
  list.replaceChildren();

  let entries;

  try {
    entries = kernel.bino.dir.list(path);
  } catch (error) {
    kernel.system.log(`Failed to read ${path}: ${error}`, "error");
    return;
  }

  if (!Array.isArray(entries)) {
    kernel.system.log(`Cannot read directory ${path}: ${entries}`, "error");
    return;
  }

  for (const entry of entries) {
    const name = String(entry);
    const entryPath = joinPath(path, name);
    const isDirectory = Array.isArray(kernel.bino.dir.list(entryPath));

    const item = document.createElement("button");
    item.className = "ranger-item";

    const icon = document.createElement("span");
    icon.className = "ranger-icon";
    icon.textContent = getIcon(name, isDirectory);

    const label = document.createElement("span");
    label.className = "ranger-name";
    label.textContent = name;

    item.append(icon, label);

    item.addEventListener("dblclick", async () => {
      if (isDirectory) {
        history.push(currentPath);
        await renderDirectory(entryPath);
        return;
      }

      const data = kernel.bino.file.read(entryPath);

      if (data === undefined) {
        kernel.system.log(`Could not read ${entryPath}`, "error");
        return;
      }

      kernel.system.log(`${name}:\n${data}`, "info");
    });

    list.appendChild(item);
  }
}

export async function app() {
  rangerWindow = await wer.win("com.krambo345.ranger");

  rangerWindow.querySelector(".wer-content").innerHTML = `
    <div class="ranger">
      <div class="ranger-toolbar">
        <button class="ranger-back">←</button>
        <button class="ranger-up">↑</button>
        <button class="ranger-root">⌂</button>
        <span class="ranger-path">/</span>
      </div>

      <div class="ranger-list"></div>
    </div>
  `;

  const content = rangerWindow.querySelector(".wer-content");

  content.querySelector(".ranger-back").addEventListener("click", async () => {
    if (!history.length) return;

    const previous = history.pop();
    await renderDirectory(previous);
  });

  content.querySelector(".ranger-up").addEventListener("click", async () => {
    if (currentPath === "/") return;

    history.push(currentPath);
    await renderDirectory(parentPath(currentPath));
  });

  content.querySelector(".ranger-root").addEventListener("click", async () => {
    history = [];
    await renderDirectory("/");
  });

  await renderDirectory("/");
  return true;
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