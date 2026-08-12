const kernel = window.modOS.kernel;
const structurePackages = window.modOS.variables.structurePackages;
const libJSONloc = window.modOS.variables.libJSONloc;
const display = document.querySelector(".display");
const desktop = document.createElement("div");
display.appendChild(desktop)
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
  const icon = document.createElement("div");
  const img = document.createElement("img");
  const label = document.createElement("span");
  try {
    desktop.appendChild(icon)
    icon.className = "desktop-icon";
    img.src = `${kernel.base}icons/${pkg.icon}.png`;
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

  if (desktop) {
    desktop.replaceChildren();
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

    if (desktop) {
      desktop.appendChild(fragment);
    }
  }
  catch (error){
    return kernel.system.log(error, "error")
  }

  return true;
}

export async function kill() {
  if (desktop) {
    desktop.replaceChildren();
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