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

async function updateBar() {
  const date = new Date();
  const barLeft = document.querySelector(".bartender-barLeft");
  const barMiddle = document.querySelector(".bartender-barMiddle");
  const windows = document.querySelectorAll(".wer-win")
  barLeft.replaceChildren()
  windows.forEach(win => {
    if (window.getComputedStyle(win).display == "none") {
      const icon = document.createElement("div");
      const img = document.createElement("img");
      const label = document.createElement("span");
      icon.appendChild(img);
      icon.appendChild(label);
      barLeft.appendChild(icon);
      icon.addEventListener("click",
        win.style.display == "block"
      )
    }
  });
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

    updateInterval = setInterval(() => {
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
  else {
    kernel.system.log("Failed to kill bartender", "error");
  }
}

export function commands() {
  return {
    desktop: {
      args: "<arg>",
      description: "Refresh Bartender",
      run: async () => await app(),
    },
  };
}