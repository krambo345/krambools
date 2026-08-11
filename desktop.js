const kernel = window.modOS.kernel;
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
    console.error("Failed to inject desktop CSS:", error);
  }
}

async function fetchPackages() {
  try {
    const pckgs = kernel ? await kernel.packer.fetch() : [];
    return Array.isArray(pckgs) ? pckgs : [];
  } catch (error) {
    if (kernel) await kernel.system.log(error, "error");
    return [];
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
      // start() requires the package to already be installed — it doesn't
      // auto-install. get() is a no-op if it's already cached, so it's
      // always safe to call before start().
      await kernel.packer.get(pkg.id);
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
  const pckgs = await fetchPackages();
  const fragment = document.createDocumentFragment();
  pckgs.forEach((pkg) => {
    if (!pkg.id) return;
    fragment.appendChild(buildIcon(pkg));
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