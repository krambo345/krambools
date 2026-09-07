// The Settings Package is COMPLETELY AI generated due to the immerse difficulty. Sorry.
const kernel = window.modOS.kernel;
const wer = window.modOS.wer;
const variables = window.modOS.variables;
const display = document.querySelector(".display");

const PCKG = "com.krambo345.settings";
const menuOptions = ["account", "customization"];

const usrSettingsLoc = variables.usrSettingsLoc;
const structureUsr = variables.structureUsr;

const DEFAULTS = {
  backgroundImage:
    "https://raw.githubusercontent.com/krambo345/krambools/refs/heads/master/sevda.png",
  splash: false,
  borderColor: "#0077ff",
  fontColor: "#000000",
  fontFamily: "Fira Code",
  buttons: {
    minimize: "#d1d100",
    maximize: "#41b000",
    close: "#d10000",
  },
};

const FONT_CHOICES = [
  "Fira Code",
  "Arial",
  "Times New Roman",
  "Courier New"
];

let currentWindow = null;
let currentTab = "account";
let liveCustomization = { ...DEFAULTS, buttons: { ...DEFAULTS.buttons } };

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

function injectLocalCSS() {
  if (document.querySelector('style[data-krambools-settings]')) return;

  const style = document.createElement("style");
  style.dataset.kramboolsSettings = "true";
  style.textContent = `
  .settings-layout {
    display: flex;
    height: 100%;
    min-height: 340px;
    box-sizing: border-box;
  }
  .settings-menu {
    display: flex;
    flex-direction: column;
    width: 150px;
    flex-shrink: 0;
    background: #eee;
    border-right: 1px solid #aaa;
    box-sizing: border-box;
  }
  .settings-optionContainer {
    display: flex;
    flex-direction: column;
  }
  .settings-menuOption {
    border: none;
    background: none;
    text-align: left;
    padding: 12px 16px;
    color: #000;
    font-size: 14px;
    text-transform: capitalize;
    border-bottom: 1px solid #ddd;
  }
  .settings-menuOption:hover {
    background: #ddd;
  }
  .settings-menuOption.active {
    background: #0077ff;
    color: #fff;
  }
  .settings-contentContainer {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    box-sizing: border-box;
    color: #000;
  }
  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #ddd;
  }
  .settings-row-label {
    font-size: 14px;
  }
  .settings-text-input,
  .settings-select {
    flex: 1;
    max-width: 220px;
    padding: 6px 8px;
    border: 1px solid #aaa;
    box-sizing: border-box;
    background: #fff;
    color: #000;
  }
  .settings-checkbox {
    width: 18px;
    height: 18px;
  }
  .settings-color-input {
    width: 44px;
    height: 30px;
    border: 1px solid #aaa;
    padding: 0;
    background: none;
  }
  .settings-button {
    padding: 8px 14px;
    border: 1px solid #0077ff;
    background: #0077ff;
    color: #fff;
    border-radius: 4px;
  }
  .settings-button:hover {
    background: #338fff;
  }
  .settings-button:disabled {
    opacity: 0.5;
    background: #999;
    border-color: #999;
  }
  .settings-account {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .settings-account-uid {
    font-weight: bold;
  }
  .settings-account-buttons {
    display: flex;
    gap: 10px;
  }
  .settings-account-linkpanel {
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: #f4f4f4;
    border: 1px solid #ccc;
  }
  .settings-account-linkpassword {
    padding: 6px 8px;
    border: 1px solid #aaa;
  }
  .settings-subheading {
    margin: 16px 0 4px;
    font-size: 14px;
    color: #333;
  }
  .settings-reset {
    margin-top: 16px;
    background: #d10000;
    border-color: #d10000;
  }
  .settings-reset:hover {
    background: #ff3030;
  }
  `;
  document.head.appendChild(style);
}

function sanitizeUrl(url) {
  return String(url).replace(/["'\\]/g, "");
}

function normalizeHex(value, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function applyCustomizationStyles(custom) {
  let style = document.querySelector('style[data-krambools-customization]');
  if (!style) {
    style = document.createElement("style");
    style.dataset.kramboolsCustomization = "true";
    document.head.appendChild(style);
  }

  const bg = sanitizeUrl(custom.backgroundImage || DEFAULTS.backgroundImage);
  const border = normalizeHex(custom.borderColor, DEFAULTS.borderColor);
  const fontColor = normalizeHex(custom.fontColor, DEFAULTS.fontColor);
  const fontFamily = custom.fontFamily || DEFAULTS.fontFamily;
  const buttons = custom.buttons || DEFAULTS.buttons;
  const minimize = normalizeHex(buttons.minimize, DEFAULTS.buttons.minimize);
  const maximize = normalizeHex(buttons.maximize, DEFAULTS.buttons.maximize);
  const close = normalizeHex(buttons.close, DEFAULTS.buttons.close);

  style.textContent = `
  .display {
    background-image: url("${bg}") !important;
  }
  .wer-win {
    border-color: ${border} !important;
    color: ${fontColor} !important;
  }
  .wer-winheader{
    background-color: ${border} !important;
  }
  * {
    font-family: "${fontFamily}", "Fira Code", monospace !important;
  }
  .wer-minimwin {
    background-color: ${minimize} !important;
  }
  .wer-fullwin {
    background-color: ${maximize} !important;
  }
  .wer-closewin {
    background-color: ${close} !important;
  }
  `;
}

function readLocalSettings() {
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

function writeLocalSettings(obj) {
  try {
    kernel.bino.dir.make(structureUsr);
    kernel.bino.file.write(usrSettingsLoc, JSON.stringify(obj, null, 2));
    return true;
  } catch (error) {
    kernel.system.log(`Failed to write settings: ${error}`, "error");
    return false;
  }
}

function fillCustomizationDefaults(custom) {
  const source = custom || {};
  const buttons = source.buttons || {};

  return {
    backgroundImage: source.backgroundImage || DEFAULTS.backgroundImage,
    borderColor: normalizeHex(source.borderColor, DEFAULTS.borderColor),
    fontColor: normalizeHex(source.fontColor, DEFAULTS.fontColor),
    fontFamily: source.fontFamily || DEFAULTS.fontFamily,
    splash: typeof source.splash === "boolean" ? source.splash : DEFAULTS.splash,
    buttons: {
      minimize: normalizeHex(buttons.minimize, DEFAULTS.buttons.minimize),
      maximize: normalizeHex(buttons.maximize, DEFAULTS.buttons.maximize),
      close: normalizeHex(buttons.close, DEFAULTS.buttons.close),
    },
  };
}

async function loadCustomization() {
  const local = readLocalSettings();
  let custom = local.customization;

  if (!custom) {
    try {
      const uid = await kernel.account.sessionUID();
      if (uid) {
        const cloudSettings = await kernel.account.getSettings();
        if (cloudSettings && cloudSettings.customization) {
          custom = cloudSettings.customization;
          writeLocalSettings({ ...local, customization: custom });
        }
      }
    } catch (error) {
      kernel.system.log(`Failed to load account settings: ${error}`, "warn");
    }
  }

  return fillCustomizationDefaults(custom);
}

async function saveCustomization(partial) {
  const local = readLocalSettings();
  const current = fillCustomizationDefaults(local.customization);

  const merged = {
    ...current,
    ...partial,
    buttons: { ...current.buttons, ...(partial.buttons || {}) },
  };

  writeLocalSettings({ ...local, customization: merged });

  try {
    const uid = await kernel.account.sessionUID();
    if (uid) {
      await kernel.account.updateSettings();
      kernel.system.log("Customization synced to account", "success");
    }
  } catch (error) {
    kernel.system.log(`Failed to sync customization: ${error}`, "warn");
  }

  return merged;
}

function buildColorRow(labelText, initialValue, onPreview, onCommit) {
  const row = document.createElement("div");
  row.className = "settings-row";

  const label = document.createElement("span");
  label.className = "settings-row-label";
  label.textContent = labelText;

  const input = document.createElement("input");
  input.type = "color";
  input.className = "settings-color-input";
  input.value = initialValue;

  row.append(label, input);

  input.addEventListener("input", () => onPreview(input.value));
  input.addEventListener("change", () => onCommit(input.value));

  return row;
}

async function renderAccountTab(container) {
  container.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "settings-account";

  const uidRow = document.createElement("div");
  uidRow.className = "settings-row";

  const uidLabel = document.createElement("span");
  uidLabel.className = "settings-row-label";
  uidLabel.textContent = "User ID";

  const uidValue = document.createElement("span");
  uidValue.className = "settings-account-uid";

  uidRow.append(uidLabel, uidValue);

  const buttonsRow = document.createElement("div");
  buttonsRow.className = "settings-account-buttons";

  const signOutBtn = document.createElement("button");
  signOutBtn.className = "settings-button";
  signOutBtn.textContent = "Sign Out";

  const linkBtn = document.createElement("button");
  linkBtn.className = "settings-button";
  linkBtn.textContent = "Link Account";

  buttonsRow.append(signOutBtn, linkBtn);

  const linkPanel = document.createElement("div");
  linkPanel.className = "settings-account-linkpanel";
  linkPanel.innerHTML = `
  <p>An account already exists for <span class="settings-account-linkemail"></span>. Enter its password to link Google sign-in.</p>
  <input type="password" class="settings-account-linkpassword" placeholder="Password" autocomplete="current-password">
  <button type="button" class="settings-button settings-account-linkconfirm">Confirm Link</button>
  `;

  wrap.append(uidRow, buttonsRow, linkPanel);
  container.appendChild(wrap);

  const linkEmailEl = linkPanel.querySelector(".settings-account-linkemail");
  const linkPasswordEl = linkPanel.querySelector(".settings-account-linkpassword");
  const linkConfirmEl = linkPanel.querySelector(".settings-account-linkconfirm");

  async function refresh() {
    let uid;
    try {
      uid = await kernel.account.sessionUID();
    } catch (error) {
      uid = undefined;
    }

    if (uid) {
      uidValue.textContent = uid;
      signOutBtn.disabled = false;
      linkBtn.disabled = false;
    } else {
      uidValue.textContent = "Not signed in (guest)";
      signOutBtn.disabled = true;
      linkBtn.disabled = true;
    }

    linkPanel.style.display = "none";
    linkPasswordEl.value = "";
  }

  signOutBtn.addEventListener("click", async () => {
    try {
      await kernel.account.signOut();
      kernel.system.log("Signed out", "success");
    } catch (error) {
      kernel.system.log(`Sign out failed: ${error}`, "error");
    }
    await refresh();
  });

  linkBtn.addEventListener("click", async () => {
    try {
      await kernel.account.manageWithGoogle();
      kernel.system.log("Google account linked", "success");
      await refresh();
    } catch (error) {
      if (error && error.code === "modos/link-required") {
        linkEmailEl.textContent = error.email || "";
        linkPanel.style.display = "flex";
        linkPasswordEl.focus();
      } else {
        kernel.system.log(`Link failed: ${error}`, "error");
      }
    }
  });

  linkConfirmEl.addEventListener("click", async () => {
    const password = linkPasswordEl.value;
    try {
      await kernel.account.linkGoogle(password);
      kernel.system.log("Google account linked", "success");
      await refresh();
    } catch (error) {
      kernel.system.log(`Link failed: ${error}`, "error");
    }
  });

  await refresh();
}

async function renderCustomizationTab(container) {
  container.innerHTML = "";

  const custom = liveCustomization;
  const wrap = document.createElement("div");
  wrap.className = "settings-customization";

  const bgRow = document.createElement("div");
  bgRow.className = "settings-row";

  const bgLabel = document.createElement("span");
  bgLabel.className = "settings-row-label";
  bgLabel.textContent = "Background Image URL";

  const bgInput = document.createElement("input");
  bgInput.type = "url";
  bgInput.className = "settings-text-input";
  bgInput.placeholder = "https://example.com/image.png";
  bgInput.value = custom.backgroundImage;

  bgRow.append(bgLabel, bgInput);

  bgInput.addEventListener("change", async () => {
    const url = bgInput.value.trim();
    if (!url) return;
    liveCustomization = { ...liveCustomization, backgroundImage: url };
    applyCustomizationStyles(liveCustomization);
    liveCustomization = await saveCustomization({ backgroundImage: url });
  });

  const borderRow = buildColorRow(
    "Window Border Color",
    custom.borderColor,
    (val) => applyCustomizationStyles({ ...liveCustomization, borderColor: val }),
    async (val) => {
      liveCustomization = { ...liveCustomization, borderColor: val };
      liveCustomization = await saveCustomization({ borderColor: val });
    }
  );

  const fontColorRow = buildColorRow(
    "Font Color",
    custom.fontColor,
    (val) => applyCustomizationStyles({ ...liveCustomization, fontColor: val }),
    async (val) => {
      liveCustomization = { ...liveCustomization, fontColor: val };
      liveCustomization = await saveCustomization({ fontColor: val });
    }
  );

  const fontRow = document.createElement("div");
  fontRow.className = "settings-row";

  const fontLabel = document.createElement("span");
  fontLabel.className = "settings-row-label";
  fontLabel.textContent = "Font Family";

  const fontSelect = document.createElement("select");
  fontSelect.className = "settings-select";

  FONT_CHOICES.forEach((font) => {
    const opt = document.createElement("option");
    opt.value = font;
    opt.textContent = font;
    if (font === custom.fontFamily) opt.selected = true;
    fontSelect.appendChild(opt);
  });

  fontRow.append(fontLabel, fontSelect);

  fontSelect.addEventListener("change", async () => {
    liveCustomization = { ...liveCustomization, fontFamily: fontSelect.value };
    applyCustomizationStyles(liveCustomization);
    liveCustomization = await saveCustomization({ fontFamily: fontSelect.value });
  });
  const splashRow = document.createElement("div");
  splashRow.className = "settings-row";
  const splashLabel = document.createElement("span");
  splashLabel.className = "settings-row-label";
  splashLabel.textContent = "modOS Splash";
  const splashCheckbox = document.createElement("input");
  splashCheckbox.type = "checkbox";
  splashCheckbox.className = "settings-checkbox";
  splashCheckbox.checked = custom.splash;

  splashRow.append(splashLabel, splashCheckbox);
  splashCheckbox.addEventListener("change", async () => {
    liveCustomization = { ...liveCustomization, splash: splashCheckbox.checked };
    liveCustomization = await saveCustomization({ splash: splashCheckbox.checled });
  })
  const btnHeading = document.createElement("h3");
  btnHeading.className = "settings-subheading";
  btnHeading.textContent = "Window Buttons";

  const minimizeRow = buildColorRow(
    "Minimize Button",
    custom.buttons.minimize,
    (val) =>
      applyCustomizationStyles({
        ...liveCustomization,
        buttons: { ...liveCustomization.buttons, minimize: val },
      }),
    async (val) => {
      liveCustomization = {
        ...liveCustomization,
        buttons: { ...liveCustomization.buttons, minimize: val },
      };
      liveCustomization = await saveCustomization({ buttons: { minimize: val } });
    }
  );

  const maximizeRow = buildColorRow(
    "Maximize Button",
    custom.buttons.maximize,
    (val) =>
      applyCustomizationStyles({
        ...liveCustomization,
        buttons: { ...liveCustomization.buttons, maximize: val },
      }),
    async (val) => {
      liveCustomization = {
        ...liveCustomization,
        buttons: { ...liveCustomization.buttons, maximize: val },
      };
      liveCustomization = await saveCustomization({ buttons: { maximize: val } });
    }
  );

  const closeRow = buildColorRow(
    "Close Button",
    custom.buttons.close,
    (val) =>
      applyCustomizationStyles({
        ...liveCustomization,
        buttons: { ...liveCustomization.buttons, close: val },
      }),
    async (val) => {
      liveCustomization = {
        ...liveCustomization,
        buttons: { ...liveCustomization.buttons, close: val },
      };
      liveCustomization = await saveCustomization({ buttons: { close: val } });
    }
  );

  const resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "settings-button settings-reset";
  resetBtn.textContent = "Reset to Defaults";

  resetBtn.addEventListener("click", async () => {
    const defaults = { ...DEFAULTS, buttons: { ...DEFAULTS.buttons } };
    liveCustomization = defaults;
    applyCustomizationStyles(liveCustomization);
    liveCustomization = await saveCustomization(defaults);
    await renderCustomizationTab(container);
  });

  wrap.append(
    bgRow,
    borderRow,
    fontColorRow,
    fontRow,
    splashRow,
    btnHeading,
    minimizeRow,
    maximizeRow,
    closeRow,
    resetBtn
  );

  container.appendChild(wrap);
}

async function buildWindow(win) {
  const content = win.querySelector(".wer-content");
  content.innerHTML = "";

  const layout = document.createElement("div");
  layout.className = "settings-layout";

  const menu = document.createElement("div");
  menu.className = "settings-menu";

  const optionContainer = document.createElement("div");
  optionContainer.className = "settings-optionContainer";
  menu.appendChild(optionContainer);

  const contentContainer = document.createElement("div");
  contentContainer.className = "settings-contentContainer";

  layout.append(menu, contentContainer);
  content.appendChild(layout);

  const tabRenderers = {
    account: renderAccountTab,
    customization: renderCustomizationTab,
  };

  const tabButtons = {};

  async function activateTab(tab) {
    currentTab = tab;
    Object.entries(tabButtons).forEach(([key, btn]) => {
      btn.classList.toggle("active", key === tab);
    });
    await tabRenderers[tab](contentContainer);
  }

  menuOptions.forEach((opt) => {
    const menuOption = document.createElement("button");
    menuOption.type = "button";
    menuOption.textContent = opt;
    menuOption.className = "settings-menuOption";
    optionContainer.appendChild(menuOption);
    tabButtons[opt] = menuOption;

    menuOption.addEventListener("click", () => activateTab(opt));
  });

  await activateTab(currentTab);
}

export async function app() {
  await kill();
  await injectCSS();
  injectLocalCSS();

  liveCustomization = await loadCustomization();
  applyCustomizationStyles(liveCustomization);

  currentWindow = await wer.win(PCKG);
  await buildWindow(currentWindow);

  return true;
}

export async function kill() {
  document.querySelectorAll(`.wer-win[data-pckg="${PCKG}"]`).forEach((el) => el.remove());
  currentWindow = null;
  return true;
}

export async function commands() {
  return {
    settings: {
      args: "<command>",
      description: "System settings and customization",
      sub: {
        open: {
          args: "",
          description: "Open the settings window",
          run: async () => {
            await app();
            return true;
          },
        },
        reset: {
          args: "",
          description: "Reset customization to defaults",
          run: async () => {
            const defaults = { ...DEFAULTS, buttons: { ...DEFAULTS.buttons } };
            liveCustomization = defaults;
            applyCustomizationStyles(liveCustomization);
            liveCustomization = await saveCustomization(defaults);
            return "Customization reset to defaults";
          },
        },
      },
    },
  };
}
