const kernel = window.modOS.kernel;
const wer = window.modOS.wer;

const usrSettingsLoc = "/usr/settings.json";
const structureUsr = "/usr";

const cssVars = {};

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

async function applyCSS(property) {
  let style = document.querySelector("style[data-krambools-css]");
  if (!style) {
    style = document.createElement("style");
    style.dataset.kramboolsCSS = true;
    document.head.appendChild(style);
  }

  Object.assign(cssVars, property);

  const declarations = Object.entries(cssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  style.textContent = `:root {\n${declarations}\n}`;
}


function readSettings() {
  try {
    if (!kernel.bino.file.check(usrSettingsLoc)) return {};
    const raw = kernel.bino.file.read(usrSettingsLoc);
    if (typeof raw !== "string") return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    kernel.system.log(`Failed to read settings: ${error}`, "warn");
    return {};
  }
}

function writeSettings(obj) {
  try {
    kernel.bino.dir.make(structureUsr);
    kernel.bino.file.write(usrSettingsLoc, JSON.stringify(obj, null, 2));
    return true;
  } catch (error) {
    kernel.system.log(`Failed to write settings: ${error}`, "error");
    return false;
  }
}

function getSetting(key, fallback) {
  const settings = readSettings();
  return key in settings ? settings[key] : fallback;
}

function setSetting(key, value) {
  const settings = readSettings();
  settings[key] = value;
  writeSettings(settings);
}

const tabPages = {};
let activeTab = null;

function base(win) {
  const menuContainer = document.createElement("div");
  const pageContainer = document.createElement("div");
  win.appendChild(menuContainer);
  win.appendChild(pageContainer);
  menuContainer.className = "settings-menu";
  pageContainer.className = "settings-page";
}

function registerTab(win, tabName, buttonLabel) {
  if (tabPages[tabName]) return tabPages[tabName];

  const menu = win.querySelector(".settings-menu");
  const pageWrap = win.querySelector(".settings-page");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = buttonLabel || tabName;
  btn.className = "settings-tabButton";
  menu.appendChild(btn);

  const page = document.createElement("div");
  page.className = "settings-tabPage";
  page.dataset.tab = tabName;
  page.style.display = "none";
  pageWrap.appendChild(page);

  btn.addEventListener("click", () => switchTab(win, tabName));

  tabPages[tabName] = { page, btn };

  if (!activeTab) switchTab(win, tabName);

  return tabPages[tabName];
}

function switchTab(tabName) {
  Object.entries(tabPages).forEach(([name, { page, btn }]) => {
    const isActive = name === tabName;
    page.style.display = isActive ? "block" : "none";
    btn.classList.toggle("active", isActive);
  });
  activeTab = tabName;
}

async function addInputs(type, label, win, parentTab, func, key, fallback) {
  const tab = registerTab(win, parentTab);
  const container = tab.page;

  const lbl = document.createElement("label");
  const inp = document.createElement("input");
  lbl.innerHTML = label;
  inp.type = type;

  if (key !== undefined) {
    const current = getSetting(key, fallback);
    if (type === "checkbox") {
      inp.checked = !!current;
    } else {
      inp.value = current;
    }
  }

  inp.addEventListener("change", (e) => {
    const value = type === "checkbox" ? e.target.checked : e.target.value;
    if (key !== undefined) setSetting(key, value);
    func(value, key);
  });

  container.appendChild(lbl);
  container.appendChild(inp);
}

export async function app() {
  injectCSS();

  applyCSS({
    "--border-color": getSetting("themeColor", "#0077ff"),
  });

  const window = await wer.win("com.krambo345.settings");
  base(window);

  addInputs(
    "url",
    "Background(link)",
    window,
    "customization",
    (value) => applyCSS({ "--backgroundImage": `url('${value}')` }),
    "backgroundImage",
    "url('https://raw.githubusercontent.com/krambo345/krambools/refs/heads/master/sevda.png')"
  );

  addInputs(
    "color",
    "Window Border Color",
    window,
    "customization",
    (value) => applyCSS({ "--windowBorderColor": value }),
    "winBorderColor",
    "#0077ff"
  );

  addInputs(
    "number",
    "Window Border Radius",
    window,
    "customization",
    (value) => applyCSS({ "--windowBorderRadius": `${value}px` }),
    "windowBorderRadius",
    "5px"
  );

  addInputs(
    "color",
    "Bartender Background Color",
    window,
    "customization",
    (value) => applyCSS({ "--bartenderBackgroundColor": value }),
    "bartenderBackgroundColor",
    "#1a1a1adc"
  );

  addInputs(
    "color",
    "Bartender Font Color",
    window,
    "customization",
    (value) => applyCSS({ "--bartebderTextColor": value }),
    "bartenderTextColor",
    "#fff"
  );

  addInputs(
    "color",
    "Desktop Label Color",
    window,
    "customization",
    (value) => applyCSS({ "--desktopLabelColor": value }),
    "desktopLabelColor",
    "#fff"
  );

  addInputs(
    "color",
    "Default Font Color",
    window,
    "customization",
    (value) => applyCSS({ "--defaultColor": value }),
    "defaultColor",
    "#000"
  );
  addInputs(
    "color",
    "Close Button Color",
    window,
    "customization",
    (value) => applyCSS({ "--windowClose": value }),
    "windowClose",
    "#d10000"
  );

  addInputs(
    "color",
    "Minimize Button Color",
    window,
    "customization",
    (value) => applyCSS({ "--windowMinim": value }),
    "windowMinim",
    "#d1d100"
  );

  addInputs(
    "color",
    "Fullscreen Button Color",
    window,
    "customization",
    (value) => applyCSS({ "--windowFull": value }),
    "windowFull",
    "#41b000"
  );



  addInputs(
    "checkbox",
    "Enable Splash Screen",
    window,
    "customization",
    (value) => kernel.system.log("Splash set to " + value, "info"),
    "splash",
    true
  );

  addInputs(
    "checkbox",
    "label",
    window,
    "parentTab",
    (value) => kernel.system.log("example function"),
    "key",
    true
  );
}

export async function kill() {
  Object.keys(tabPages).forEach((k) => delete tabPages[k]);
  activeTab = null;
}

export async function commands() {
  return {
    template: {
      args: "<arg>",
      description: "Demonstrate commands",
      sub: {
        test: {
          arg: "<string>",
          description: "Log text to system",
          run: async ([text]) => kernel.system.log(text, "warn"),
        },
      },
    },
  };
}
