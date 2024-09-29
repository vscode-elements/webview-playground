// @ts-check

const logoSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.435 73.998">
    <g fill="#007acc">
      <path d="M115.89 8.141L100.762.857a4.574 4.574 0 00-5.23.89L66.537 28.2l-12.63-9.584a3.042 3.042 0 00-3.908.173l-4.051 3.678a3.067 3.067 0 00-.015 4.526l10.963 10-10.963 10a3.067 3.067 0 00.015 4.526l4.051 3.692c1.107.992 2.745 1.064 3.908.173l12.63-9.584L95.53 72.251a4.552 4.552 0 005.216.89l15.144-7.284a4.576 4.576 0 002.6-4.138V12.28a4.552 4.552 0 00-2.6-4.138zm-15.761 45.56l-22.012-16.71 22.012-16.709zM134.34 0l-7.81 7.81L155.73 37l-29.2 29.188 7.81 7.81 33.095-33.094v-7.81zM40.904 7.81L11.704 37l29.2 29.188-7.81 7.81L0 40.904v-7.81L33.094 0z">
      </path>
    </g>
  </svg>`;

const STORAGE_KEY_PREFIX = "vscode-webview-playground";
const STORAGE_KEY_THEME = `${STORAGE_KEY_PREFIX}_theme`;
const STORAGE_KEY_UNDERLINE_LINKS = `${STORAGE_KEY_PREFIX}_underline-links`;
const STORAGE_KEY_REDUCE_MOTION = `${STORAGE_KEY_PREFIX}_reduce-motion`;
const TOOLBAR_TAG_NAME = "vscode-dev-toolbar";
const DEMO_TAG_NAME = "vscode-demo";

/** @type {ThemeId} */
let appliedTheme;
/** Calculated url of the script directory base on the `import.meta` property. */
// TODO: Use import.meta.resolve()
let directoryUrl;
/** Demo component instance counter */
let demoInstanceCounter = 0;
/** Toolbar component instance counter */
let toolbarInstanceCounter = 0;
/** @type {{[key: string]: HTMLDivElement | null}} */
const themeSelectorInstances = {};
/**
 * @typedef {"light" | "light-v2" | "dark" | "dark-v2" | "hc-light" | "hc-dark" } ThemeId
 * @typedef {Record<ThemeId, {data?: string; isFetching?: boolean;}>} ThemeRegistry
 */
/**
 * @type {ThemeRegistry}
 */
const themes = {
  light: {},
  "light-v2": {},
  dark: {},
  "dark-v2": {},
  "hc-light": {},
  "hc-dark": {},
};

/**
 * @typedef  ThemeInfoItem
 * @type {object}
 * @property {string} themeKind - Theme kind.
 * @property {string[]} bodyClasses - Classes added to body.
 * @property {string} name - Theme short name.
 * @property {string=} longName - Detailed name of theme.
 * @property {string} label - Theme switcher button label.
 * @property {string} description - Theme description.
 *
 * @typedef {Record<ThemeId, ThemeInfoItem>} ThemeInfo
 */

/** @type {ThemeInfo} */
const themeInfo = {
  light: {
    themeKind: "vscode-light",
    bodyClasses: ["vscode-light"],
    name: "Light+",
    longName: "Default Light+",
    label: "Light",
    description: "Default light theme before April 2023 (version 1.78)",
  },
  "light-v2": {
    themeKind: "vscode-light",
    bodyClasses: ["vscode-light"],
    name: "Light Modern",
    longName: "Default Light Modern",
    label: "Light v2",
    description: "Default light theme since April 2023 (version 1.78)",
  },
  dark: {
    themeKind: "vscode-dark",
    bodyClasses: ["vscode-dark"],
    name: "Dark+",
    longName: "Default Dark+",
    label: "Dark",
    description: "Default dark theme before April 2023 (version 1.78)",
  },
  "dark-v2": {
    themeKind: "vscode-dark",
    bodyClasses: ["vscode-dark"],
    name: "Dark Modern",
    longName: "Default Dark Modern",
    label: "Dark v2",
    description: "Default dark theme since April 2023 (version 1.78)",
  },
  "hc-light": {
    themeKind: "vscode-high-contrast-light",
    bodyClasses: ["vscode-high-contrast-light", "vscode-high-contrast"],
    name: "Light High Contrast",
    longName: "Default High Contrast Light",
    label: "HC Light",
    description: "Light High Contrast theme",
  },
  "hc-dark": {
    themeKind: "vscode-high-contrast",
    bodyClasses: ["vscode-high-contrast"],
    name: "Dark High Contrast",
    longName: "Default High Contrast",
    label: "HC Dark",
    description: "Dark High Contrast theme",
  },
};

function getDemoTabHeadersHTML() {
  const keys = Object.keys(themeInfo);

  return keys.reduce((previousValue, _currentValue, i, arr) => {
    const title = themeInfo[arr[i]].description;
    const label = themeInfo[arr[i]].label;

    return `${previousValue}<button title="${title}" value="${arr[i]}" class="theme-button">${label}</button>`;
  }, "");
}

function getToolbarThemeSelectorOptions() {
  const keys = Object.keys(themeInfo);

  return keys.reduce((previousValue, _currentValue, i, arr) => {
    const id = arr[i];
    const { name } = /** @type {ThemeInfoItem} */ (themeInfo[id]);

    return `${previousValue}<option value="${id}">${name}</option>`;
  }, "");
}

function getDirectoryUrl() {
  if (directoryUrl) {
    return directoryUrl;
  }

  const urlParts = import.meta.url.split("/");
  urlParts.pop();
  directoryUrl = urlParts.join("/");

  return directoryUrl;
}

/**
 * @param {ThemeId} themeId
 */
async function fetchTheme(themeId) {
  const res = await fetch(`${getDirectoryUrl()}/${themeId}.txt`);
  const theme = await res.text();

  return theme;
}

/**
 * @param {ThemeId} theme
 */
function setActiveDemoTabs(theme) {
  const instanceKeys = Object.keys(themeSelectorInstances);

  instanceKeys.forEach((k) => {
    themeSelectorInstances[k]?.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", b.value === theme);
    });
  });
}

/**
 * @param {boolean} disabled
 */
function setAllDemoTabsDisabled(disabled) {
  const instanceKeys = Object.keys(themeSelectorInstances);

  instanceKeys.forEach((k) => {
    themeSelectorInstances[k]?.querySelectorAll("button").forEach((b) => {
      b.disabled = disabled;
    });
  });
}

/**
 * @param {ThemeId} themeId
 */
async function applyTheme(themeId) {
  if (themeId === appliedTheme) {
    return;
  }

  appliedTheme = themeId;

  const themeKeys = /** @type {ThemeId[]} */ (Object.keys(themeInfo));
  const allAvailableBodyClasses = [];

  themeKeys.forEach((t) => {
    themeInfo[t].bodyClasses.forEach((tk) => {
      allAvailableBodyClasses.push(tk);
    });
  });

  const uniqBodyClasses = [...new Set(allAvailableBodyClasses)];

  document.body.classList.remove(...uniqBodyClasses);
  document.body.classList.add(...themeInfo[themeId].bodyClasses);
  document.body.dataset.vscodeThemeKind = themeInfo[themeId].themeKind;
  document.body.dataset.vscodeThemeName = themeInfo[themeId].name;
  document.body.dataset.vscodeThemeId = themeInfo[themeId].longName;

  themes[themeId] = themes[themeId] || {};

  if (themes[themeId].data) {
    document.documentElement.setAttribute("style", themes[themeId].data);
    return;
  }

  if (!themes[themeId].isFetching) {
    themes[themeId].isFetching = true;

    const theme = await fetchTheme(themeId);

    themes[themeId].isFetching = false;
    themes[themeId].data = theme;
    document.documentElement.setAttribute("style", themes[themeId].data);
  }
}

function getInitialTheme() {
  const defaultTheme = /** @type {ThemeId} */ (Object.keys(themeInfo)[0]);
  let selectedTheme = defaultTheme;
  const theme = localStorage.getItem(STORAGE_KEY_THEME);

  if (theme && theme in themeInfo) {
    selectedTheme = /** @type {ThemeId} */ (theme);
  }

  return selectedTheme;
}

// TODO: remove this
async function applyInitialTheme() {
  const defaultTheme = /** @type {ThemeId} */ (Object.keys(themeInfo)[0]);
  let selectedTheme = defaultTheme;
  const theme = localStorage.getItem(STORAGE_KEY_THEME);
  const reduceMotion = localStorage.getItem(STORAGE_KEY_REDUCE_MOTION);
  const underlineLinks = localStorage.getItem(STORAGE_KEY_UNDERLINE_LINKS);

  if (theme && theme in themeInfo) {
    selectedTheme = /** @type {ThemeId} */ (theme);
  }

  document.body.classList.toggle(
    "vscode-reduce-motion",
    reduceMotion === "true"
  );

  await applyTheme(selectedTheme);
  setActiveDemoTabs(selectedTheme);
}

const toolbarTemplate = document.createElement("template");
toolbarTemplate.innerHTML = `
  <style>
    :host {
      bottom: 30px;
      position: fixed;
      right: 30px;
    }

    label {
      user-select: none;
    }
  </style>
  <div>
    <div>
      <label for="theme-selector">Theme</label>
      <select id="theme-selector">${getToolbarThemeSelectorOptions()}</select>
    </div>
    <div>
      <input type="checkbox" id="toggle-underline">
      <label for="toggle-underline">Underline links <span>(accessibility.underlineLinks)</span></label>
    </div>
    <div>
      <input type="checkbox" id="toggle-reduce-motion">
      <label for="toggle-reduce-motion">Reduce motion <span>(workbench.reduceMotion)</span></label>
    </div>
    <!-- TODO: location (sidebar, editor) -->
  </div>
`;

class VscodeDevToolbar extends HTMLElement {
  constructor() {
    super();

    if (toolbarInstanceCounter > 0) {
      return;
    }

    toolbarInstanceCounter += 1;

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(toolbarTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    const initialTheme = getInitialTheme();

    applyTheme(initialTheme).then(() => {
      setActiveDemoTabs(initialTheme);
    });
  }
}

const demoTemplate = document.createElement("template");
demoTemplate.innerHTML = `
  <style>
    :host {
      all: initial;
      box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.1);
      display: block;
      margin: 32px 0;
    }

    :host([fullscreen]) {
      bottom: 0;
      left: 0;
      margin: 0;
      position: fixed;
      right: 0;
      top: 0;
      z-index: 1000;
    }

    .canvas {
      all: initial;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      padding: 20px;
    }

    :host([fullscreen]) .canvas {
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 35px;
    }

    .theme-selector-wrapper {
      position: relative;
    }

    .theme-selector {
      align-items: center;
      background-color: var(--toolbar-background, #fff);
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      position: relative;
      width: 100%;
      z-index: 2;
    }

    .theme-selector:after {
      background-color: var(--toolbar-normal, #24292e);
      bottom: 0;
      content: '';
      display: block;
      height: 1px;
      left: 0;
      opacity: 0.2;
      pointer-events: none;
      position: absolute;
      width: 100%;
    }

    .theme-selector button.theme-button {
      background-color: transparent;
      border: 0;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      color: var(--toolbar-normal, #24292e);
      display: block;
      outline: none;
      overflow: hidden;
      padding: 10px 15px 7px;
    }

    .theme-selector button.theme-button:disabled {
      opacity: 0.5;
    }

    .theme-selector button.theme-button.active {
      border-bottom-color: var(--toolbar-active, #007acc);
      color:  var(--toolbar-active, #007acc);
    }

    .theme-selector button.theme-button span {
      display: block;
      outline-offset: 2px;
      pointer-events: none;
      white-space: nowrap;
    }

    .theme-selector button:focus-visible span {
      outline: 1px solid var(--toolbar-active, #007acc);
    }

    .theme-selector .toggle-fullscreen-button {
      align-items: center;
      background-color: transparent;
      border: 0;
      color: var(--toolbar-normal, #24292e);
      cursor: pointer;
      display: flex;
      justify-content: center;
      margin-left: auto;
      margin-right: 5px;
      padding: 5px;
    }

    .theme-selector .toggle-fullscreen-button .normal {
      display: none;
    }

    :host([fullscreen]) .toggle-fullscreen-button .normal {
      display: block;
    }

    :host([fullscreen]) .toggle-fullscreen-button .full {
      display: none;
    }

    .theme-selector .toggle-fullscreen-button:focus {
      outline: none;
    }

    .theme-selector .toggle-fullscreen-button:focus-visible {
      outline: 1px solid var(--toolbar-active, #007acc);
    }
  </style>
  <div class="theme-selector-wrapper">
    <div id="theme-selector" class="theme-selector">
      ${getDemoTabHeadersHTML()}
      <button type="button" class="toggle-fullscreen-button" id="toggle-fullscreen" title="toggle fullscreen">
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="full">
          <path d="M3 12h10V4H3v8zm2-6h6v4H5V6zM2 6H1V2.5l.5-.5H5v1H2v3zm13-3.5V6h-1V3h-3V2h3.5l.5.5zM14 10h1v3.5l-.5.5H11v-1h3v-3zM2 13h3v1H1.5l-.5-.5V10h1v3z"/>
        </svg>
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="normal">
          <path d="M3.5 4H1V3h2V1h1v2.5l-.5.5zM13 3V1h-1v2.5l.5.5H15V3h-2zm-1 9.5V15h1v-2h2v-1h-2.5l-.5.5zM1 12v1h2v2h1v-2.5l-.5-.5H1zm11-1.5l-.5.5h-7l-.5-.5v-5l.5-.5h7l.5.5v5zM10 7H6v2h4V7z"/>
        </svg>
      </button>
    </div>
  </div>
  <div class="canvas">
    <slot></slot>
  </div>
`;

class VscodeDemo extends HTMLElement {
  /** @type {HTMLDivElement | null} */
  _elThemeSelector = null;
  /** @type {NodeListOf<HTMLButtonElement> | null} */
  _elButtons = null;
  /** @type {HTMLButtonElement | null} */
  _elToggleFullscreen = null;

  constructor() {
    super();

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(demoTemplate.content.cloneNode(true));

    this._elThemeSelector = shadowRoot.querySelector(".theme-selector");
    this._elButtons =
      this._elThemeSelector?.querySelectorAll("button.theme-button") ?? null;
    this._elToggleFullscreen =
      this._elThemeSelector?.querySelector(".toggle-fullscreen-button") ?? null;
  }

  connectedCallback() {
    demoInstanceCounter++;
    themeSelectorInstances[`instance-${demoInstanceCounter}`] =
      this._elThemeSelector;

    this._elButtons?.forEach((b) => {
      b.addEventListener("click", this._onThemeSelectorButtonClick);
    });
    this._elToggleFullscreen?.addEventListener(
      "click",
      this._onToggleFullscreenButtonClick
    );

    const initialTheme = getInitialTheme();

    applyTheme(initialTheme);
    setActiveDemoTabs(initialTheme);
  }

  disconnectedCallback() {
    this._elButtons?.forEach((b) => {
      b.removeEventListener("click", this._onThemeSelectorButtonClick);
    });
    this._elToggleFullscreen?.removeEventListener(
      "click",
      this._onToggleFullscreenButtonClick
    );
  }

  /**
   * @param {MouseEvent} ev
   */
  _onThemeSelectorButtonClick = (ev) => {
    const bt = /** @type {HTMLButtonElement} */ (ev.target);
    const value = /** @type {ThemeId} */ (bt.value);

    setActiveDemoTabs(value);
    setAllDemoTabsDisabled(true);

    applyTheme(value).then(() => {
      setAllDemoTabsDisabled(false);
    });

    localStorage.setItem(STORAGE_KEY_THEME, value);
  };

  _onToggleFullscreenButtonClick = () => {
    if (!this.hasAttribute("fullscreen")) {
      this.setAttribute("fullscreen", "");
    } else {
      this.removeAttribute("fullscreen");
    }
  };
}

customElements.define(TOOLBAR_TAG_NAME, VscodeDevToolbar);
customElements.define(DEMO_TAG_NAME, VscodeDemo);
