const display = document.querySelector(".display");

function getKernel() {
  return window.modOS?.kernel;
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
    console.error("Failed to inject desktop CSS:", error);
  }
}

async function fetchPackages() {
  try {
    const kernel = getKernel();
    const pckgs = kernel ? await kernel.packer.fetch() : [];
    return Array.isArray(pckgs) ? pckgs : [];
  } catch (error) {
    const kernel = getKernel();
    if (kernel) await kernel.system.log(error, "error");
    return [];
  }
}

function buildIcon(pkg) {
  const icon = document.createElement("div");
  icon.className = "desktop-icon";
  
  const img = document.createElement("img");
  img.src = `icons/${pkg.icon}.png`;
  
  const label = document.createElement("span");
  label.textContent = pkg.name;

  icon.appendChild(img);
  icon.appendChild(label);

  icon.addEventListener("dblclick", async () => {
    try {
      const kernel = getKernel();
      if (kernel) await kernel.packer.start(pkg.id);
    } catch (error) {
      const kernel = getKernel();
      if (kernel) kernel.system.log(error, "error");
    }
  });

  return icon;
}

export async function app() {
  const kernel = getKernel();
  if (kernel && kernel.terminal) {
    await kernel.terminal.kill();
  }

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
      run: async ([name]) => 
        await app()
    },
  };
}