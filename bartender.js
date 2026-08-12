const kernel = window.modOS.kernel;
const structurePackages = window.modOS.variables.structurePackages;
const libJSONloc = window.modOS.variables.libJSONloc;
const display = document.querySelector(".display");
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

function buildIcon(pkg) {

  try {
    icon.className = "desktop-icon";

    label.textContent = pkg.name;

    icon.appendChild(img);
    icon.appendChild(label);
  }
  catch (error) {
    return kernel.system.log(error, "error")
  }


  icon.addEventListener("dblclick", async () => {
    try {
      if (!kernel) return;
      const started = await kernel.packer.start(pkg.id);
      if (!started) {
        await kernel.system.log(`Failed to start ${pkg.id}`, "error");
      }
    } catch (error) {
      if (kernel) kernel.system.log(error, "error");
    }
  });

  return icon;
}

export async function app() {
  await injectCSS();

  if (display) {
    display.replaceChildren();
  }
  try {
    const installed = await kernel.bino.dir.list(structurePackages);
    const installedIds = Array.isArray(installed) ? installed : [];

    const pckgs = installedIds.length
      ? JSON.parse(await kernel.bino.file.read(libJSONloc))
      : [];

    const fragment = document.createDocumentFragment();

    installedIds.forEach((id) => {
      const packageData = Array.isArray(pckgs) ? pckgs.find((p) => p.id === id) : null;
      if (!packageData) return;
      fragment.appendChild(buildIcon(packageData));
    });

    if (display) {
      display.appendChild(fragment);
    }
  }
  catch (error) {
    return kernel.system.log(error, "error")
  }

  return true;
}

export async function kill() {
  if (display) {
    display.replaceChildren();
  }
  const styleTag = document.querySelector('style[data-krambools]');
  if (styleTag) {
    styleTag.remove();
  }

  return true;
}

export function commands() {
  return {
    desktop: {
      args: "<arg>",
      description: "Refresh Desktop",
      run: async () => await app(),
    },
  };
}