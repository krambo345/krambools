let zlast = 1;
let observer = null;
const wired = new WeakSet();

function insertFunctions(win) {
  const header = win.querySelector(".winheader");
  header.insertAdjacentHTML(
    "beforeend",
    `<div class="winl"><img src="/icons/${win.dataset.windowicon}.png" class="windowicon"></img><span>${win.dataset.windowname}</span></div><div class="winr"><button class="minimwin"></button><button class="closewin"></button></div>`,
  );

  header.querySelector(".minimwin").addEventListener("click", () => {
    minimwin(header.closest(".win"));
  });
  header.querySelector(".closewin").addEventListener("click", () => {
    closewin(header.closest(".win"));
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
  const header = element.querySelector(".winheader");
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

function injectStylesheet() {
  if (document.querySelector('link[data-krambools]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.krambools = "true";
  link.href = "https://raw.githubusercontent.com/krambo345/krambools/refs/heads/master/krambools.css";
  document.head.appendChild(link);
}

// Exported so other modules can import and call these directly, and also
// attached to window so you can reach them from the console or from inline
// HTML (e.g. onclick="minimwin(this.closest('.win'))") without importing.
export { insertFunctions, dragElement, minimwin, closewin, initwindow };
window.insertFunctions = insertFunctions;
window.dragElement = dragElement;
window.minimwin = minimwin;
window.closewin = closewin;
window.initwindow = initwindow;

export function app() {
  injectStylesheet();

  // Wire up any .win elements already in the DOM.
  document.querySelectorAll(".win").forEach(initwindow);

  // Wire up any .win elements created after this point — by desktop.js's
  // exec(), or anything else — with no external call needed.
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.matches?.(".win")) initwindow(node);
        node.querySelectorAll?.(".win").forEach(initwindow);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

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