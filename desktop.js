const display = document.querySelector(".display");

function getKernel() {
  return window.modOS?.kernel;
}

async function injectCSS() {
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
  icon.innerHTML = `<img src="icons/${pkg.icon}.png"><span>${pkg.name}</span>`;

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
  await injectCSS();

  if (display) display.replaceChildren();
  const pckgs = await fetchPackages();
  pckgs.forEach((pkg) => {
    if (!pkg.id || !display) return;
    display.appendChild(buildIcon(pkg));
  });

  return true;
}

export async function kill() {
  if (display) display.replaceChildren();
  return true;
}

export function commands() {
  return {
    hello: {
      args: "<string>",
      description: "Print Hello Name",
      run: async ([name]) => `Hello ${name || "World"}!`,
    },
  };
}