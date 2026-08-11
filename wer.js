const kernel = window.modOS.kernel;
let zlast = 1;
let observer = null;
const wired = new WeakSet();

function insertFunctions(win) {
  const header = win.querySelector(".wer-winheader");

  header.insertAdjacentHTML(
    "beforeend",
    `<div class="wer-winl"><img src="${kernel.base}icons/${win.dataset.windowicon}.png" class="wer-windowicon"></img><span>${win.dataset.windowname}</span></div><div class="wer-winr"><button class="wer-minimwin"></button><button class="wer-closewin"></button></div>`,
  );

  header.querySelector(".wer-minimwin").addEventListener("click", () => {
    minimwin(header.closest(".wer-win"));
  });

  header.querySelector(".wer-closewin").addEventListener("click", () => {
    closewin(header.closest(".wer-win"));
  });
}

function windowz(e) {
  zlast++;
  e.style.zIndex = zlast;
}

function minimwin(e) {
  e.style.display = "none";
}

function closewin(e) {
  e.remove();
}

function dragElement(element) {
  windowz(element);

  const header = element.querySelector(".wer-winheader");

  let initialX = 0;
  let initialY = 0;

  function startDragging(e) {
    windowz(element);
    e = e || window.event;
    e.preventDefault();

    initialX = e.clientX;
    initialY = e.clientY;

    document.onmouseup = stopDragging;
    document.onmousemove = onDrag;
  }

  function onDrag(e) {
    e = e || window.event;
    e.preventDefault();

    const currentX = initialX - e.clientX;
    const currentY = initialY - e.clientY;

    initialX = e.clientX;
    initialY = e.clientY;

    element.style.top = element.offsetTop - currentY + "px";
    element.style.left = element.offsetLeft - currentX + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  if (header) {
    header.onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }
}

function initwindow(win) {
  if (wired.has(win)) return;

  wired.add(win);
  insertFunctions(win);
  dragElement(win);
}

function createWindow(pckg) {
  const win = document.createElement("div");
  win.className = "wer-win";
  win.dataset.windowicon = pckg.icon;
  win.dataset.windowname = pckg.name;
  win.dataset.pckg = pckg;

  const header = document.createElement("div");
  header.className = "wer-winheader";
  win.appendChild(header);

  const content = document.createElement("div");
  content.className = "wer-content";
  win.appendChild(content);

  document.body.appendChild(win);
  initwindow(win);
  return win;
}

async function injectStylesheet() {
  if (document.querySelector('link[data-krambools]')) return;

  const response = await fetch(
    "https://raw.githubusercontent.com/krambo345/krambools/refs/heads/master/krambools.css",
  );

  const css = await response.text();

  const blob = new Blob([css], { type: "text/css" });
  const link = document.createElement("link");

  link.rel = "stylesheet";
  link.dataset.krambools = "true";
  link.href = URL.createObjectURL(blob);

  document.head.appendChild(link);
}

export {
  insertFunctions,
  dragElement,
  minimwin,
  closewin,
  initwindow,
  createWindow,
};

window.insertFunctions = insertFunctions;
window.dragElement = dragElement;
window.minimwin = minimwin;
window.closewin = closewin;
window.initwindow = initwindow;
window.createWindow = createWindow;

export async function app(pckg) {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  await injectStylesheet();

  document.querySelectorAll(".wer-win").forEach(initwindow);

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (node.matches?.(".wer-win")) {
          initwindow(node);
        }

        node.querySelectorAll?.(".wer-win").forEach(initwindow);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (pckg) {
    createWindow(pckg);
  }

  return true;
}

export function kill() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  document.onmousemove = null;
  document.onmouseup = null;

  return true;
}

export function commands() {
  return {
    wer: {
      args: "<command>",
      description: "Window manager",
      sub: {
        win: {
          args: "<pckg>",
          description: "Open a window for a package",
          run: async ([pckg]) => {
            createWindow(pckg);
            return true;
          },
        },
      },
    },
  };
}