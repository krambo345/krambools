const kernel = window.modOS.kernel;
const structurePackages = window.modOS.variables.structurePackages;
const display = document.querySelector(".display");

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
    kernel.system.log(`Failed to inject desktop CSS: ${error}`, "error");
  }
}

function buildIcon(pkg) {
  const icon = document.createElement("div");
  icon.className = "desktop-icon";
  const img = document.createElement("img");
  img.src = `${kernel.base}icons/${pkg.icon}.png`;
  const label = document.createElement("span");
  label.textContent = pkg.name;

  icon.appendChild(img);
  icon.appendChild(label);

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

  const installed = await kernel.bino.dir.list(structurePackages);
  const installedIds = Array.isArray(installed) ? installed : [];

  const pckgs = installedIds.length ? await kernel.packer.fetch() : [];
  const fragment = document.createDocumentFragment();

  installedIds.forEach((id) => {
    const packageData = Array.isArray(pckgs) ? pckgs.find((p) => p.id === id) : null;
    if (!packageData) return;
    fragment.appendChild(buildIcon(packageData));
  });

  if (display) {
    display.appendChild(fragment);
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