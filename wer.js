const kernel = window.modOS.kernel;
let zlast = 1;
let observer = null;

async function insertFunctions(win) {
  const header = win.querySelector(".wer-winheader");

  header.insertAdjacentHTML(
    "beforeend",
    `<div class="wer-winl"><img src="${kernel.base}icons/${win.dataset.windowicon}.png" class="wer-windowicon"></img><span>${win.dataset.windowname}</span></div><div class="wer-winr"><button class="wer-fullwin"></button><button class="wer-minimwin"></button><button class="wer-closewin"></button></div>`,
  );

  header.querySelector(".wer-minimwin").addEventListener("click", async () => {
    minimwin(header.closest(".wer-win"));
    await window.modOS.bartender?.update();
  });

  header.querySelector(".wer-fullwin").addEventListener("click", async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await win.requestFullscreen();
    }
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

  window.modOS.bartender?.update();
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

async function initwindow(win) {
  if (win.dataset.werWired === "true") return;

  win.dataset.werWired = "true";
  await insertFunctions(win);
  dragElement(win);
}

async function createWindow(pckg) {
  const win = document.createElement("div");
  const pckgs = await kernel.packer.fetch();
  const packageData = Array.isArray(pckgs) ? pckgs.find((p) => p.id === pckg) : null;

  win.className = "wer-win";
  win.dataset.windowicon = packageData ? packageData.icon : pckg;
  win.dataset.windowname = packageData ? packageData.name : pckg;
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
export async function app(pckg) {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  await injectCSS();

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
    await createWindow(pckg);
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
          run: async ([pckg, tags]) => {
            const win = await createWindow(pckg);
            return win
          },
        },
      },
    },
  };
}