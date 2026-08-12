import { minimwin } from "./wer";

const kernel = window.modOS.kernel;
const structurePackages = window.modOS.variables.structurePackages;
const libJSONloc = window.modOS.variables.libJSONloc;
const display = document.querySelector(".display");

let updateInterval = null;

async function buildBar() {
  const bar = document.createElement("div");
  const barLeft = document.createElement("div");
  const barMiddle = document.createElement("div");
  const barRight = document.createElement("div");

  try {
    display.appendChild(bar);
    bar.appendChild(barLeft);
    bar.appendChild(barMiddle);
    bar.appendChild(barRight);
    bar.className = "bartender-bar";
    barLeft.className = "bartender-barLeft";
    barMiddle.className = "bartender-barMiddle";
    barRight.className = "bartender-barRight";
  }
  catch (error) {
    kernel.system.log("error")
  }
}
async function addMinimized() {
  const barLeft = document.querySelector(".bartender-barLeft");
  const windows = document.querySelectorAll(".wer-win");

  barLeft.replaceChildren();

  let minimized = 0;

  windows.forEach(win => {
    if (window.getComputedStyle(win).display == "none") {
      if (minimized < 5) {
        const icon = document.createElement("div");
        const img = document.createElement("img");
        const label = document.createElement("span");

        icon.className = "bartender-minimized";
        icon.appendChild(img);
        icon.appendChild(label);
        barLeft.appendChild(icon);

        img.src = `${kernel.base}icons/${win.dataset.windowicon}.png`;
        label.innerHTML = win.dataset.windowname;

        icon.addEventListener("click", () => {
          win.style.display = "block";
          icon.remove();
        });

        minimized++;
      } else if (minimized === 5) {
        barLeft.insertAdjacentHTML("beforeend", "...");
        minimized++;
      }
    }
  });
}
async function updateBar() {
  const date = new Date;
  const month = date.toLocaleString("en-US", {
    month: "short"
  });
  const barMiddle = document.querySelector(".bartender-barMiddle");
  barMiddle.innerHTML = `${month} ${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
  await kill();
  await injectCSS();

  try {
    await buildBar();

    await updateBar();
    await addMinimized();
    updateInterval = setInterval(async () => {
      await updateBar();
    }, 1000);
  }
  catch (error) {
    return kernel.system.log(error, "error")
  }

  return true;
}

export async function kill() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  const bar = document.querySelector(".bartender-bar");

  if (bar) {
    bar.remove();
  }
}

export function commands() {
  return {
    bartender: {
      args: "<arg>",
      description: "Bartender commands",
      sub: {
        update: {
          args: "",
          description: "Update Bartender",
          run: async () => await updateBar() && await addMinimized(),
        },
        refresh: {
          args: "",
          description: "Refresh Bartender",
          run: async () => await app(),
        },
      },
    },
  };
}