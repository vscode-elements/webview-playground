// @ts-check

const logoSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.435 73.998">
    <g fill="#007acc">
      <path d="M115.89 8.141L100.762.857a4.574 4.574 0 00-5.23.89L66.537 28.2l-12.63-9.584a3.042 3.042 0 00-3.908.173l-4.051 3.678a3.067 3.067 0 00-.015 4.526l10.963 10-10.963 10a3.067 3.067 0 00.015 4.526l4.051 3.692c1.107.992 2.745 1.064 3.908.173l12.63-9.584L95.53 72.251a4.552 4.552 0 005.216.89l15.144-7.284a4.576 4.576 0 002.6-4.138V12.28a4.552 4.552 0 00-2.6-4.138zm-15.761 45.56l-22.012-16.71 22.012-16.709zM134.34 0l-7.81 7.81L155.73 37l-29.2 29.188 7.81 7.81 33.095-33.094v-7.81zM40.904 7.81L11.704 37l29.2 29.188-7.81 7.81L0 40.904v-7.81L33.094 0z">
      </path>
    </g>
  </svg>`;

/** Calculated url of the script directory base on the `import.meta` property. */
// TODO: Use import.meta.resolve()
let directoryUrl;
/** Demo component instance counter */
let instanceCounter = 0;
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
 * @property {string[]} themeKind - Theme kind.
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
    themeKind: ["vscode-light"],
    name: "Light+",
    longName: "Default Light+",
    label: "Light",
    description: "Default light theme before April 2023 (version 1.78)",
  },
  "light-v2": {
    themeKind: ["vscode-light"],
    name: "Light Modern",
    longName: "Default Light Modern",
    label: "Light v2",
    description: "Default light theme since April 2023 (version 1.78)",
  },
  dark: {
    themeKind: ["vscode-dark"],
    name: "Dark+",
    longName: "Default Dark+",
    label: "Dark",
    description: "Default dark theme before April 2023 (version 1.78)",
  },
  "dark-v2": {
    themeKind: ["vscode-dark"],
    name: "Dark Modern",
    longName: "Default Dark Modern",
    label: "Dark v2",
    description: "Default dark theme since April 2023 (version 1.78)",
  },
  "hc-light": {
    themeKind: ["vscode-high-contrast-light", "vscode-high-contrast"],
    name: "Light High Contrast",
    longName: "Default High Contrast Light",
    label: "HC Light",
    description: "Light High Contrast theme",
  },
  "hc-dark": {
    themeKind: ["vscode-high-contrast"],
    name: "Dark High Contrast",
    longName: "Default High Contrast",
    label: "HC Dark",
    description: "Dark High Contrast theme",
  },
};

function getTabHeadersHTML() {
  const keys = Object.keys(themeInfo);

  return keys.reduce((previousValue, _currentValue, i, arr) => {
    const title = themeInfo[arr[i]].description;
    const label = themeInfo[arr[i]].label;

    return `${previousValue}<button title="${title}" value="${arr[i]}" class="theme-button">${label}</button>`;
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

class VscodeDevToolbar extends HTMLElement {}

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
      ${getTabHeadersHTML()}
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
    this._elButtons = this._elThemeSelector?.querySelectorAll(
      "button.theme-button"
    ) ?? null;
    this._elToggleFullscreen = this._elThemeSelector?.querySelector(
      ".toggle-fullscreen-button"
    ) ?? null;
  }

  connectedCallback() {
    instanceCounter++;
    themeSelectorInstances[`instance-${instanceCounter}`] =
      this._elThemeSelector;

    this._elButtons?.forEach((b) => {
      b.addEventListener("click", this._onThemeSelectorButtonClick);
    });
    this._elToggleFullscreen?.addEventListener(
      "click",
      this._onToggleFullscreenButtonClick
    );

    this._applyTheme("light");
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
    const bt = /** @type {HTMLButtonElement} */(ev.target);
    const value = /** @type {ThemeId} */(bt.value);

    this._setActiveTabs(value);
    this._setAllTabsDisabled(true);

    this._applyTheme(value).then(() => {
      this._setAllTabsDisabled(false);
    });
  };

  _onToggleFullscreenButtonClick = () => {
    if (!this.hasAttribute("fullscreen")) {
      this.setAttribute("fullscreen", "");
    } else {
      this.removeAttribute("fullscreen");
    }
  };

  /**
   * @param {ThemeId} theme
   */
  _setActiveTabs(theme) {
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
  _setAllTabsDisabled(disabled) {
    const instanceKeys = Object.keys(themeSelectorInstances);

    instanceKeys.forEach((k) => {
      themeSelectorInstances[k]?.querySelectorAll("button").forEach((b) => {
        b.disabled = disabled;
      });
    });
  }

  /**
   * @param {ThemeId} themeName
   */
  async _applyTheme(themeName) {
    const themeKeys = Object.keys(themeInfo);
    const themeKindClasses = [];
    const kind = themeInfo[themeName].themeKind;

    themeKeys.forEach((t) => {
      themeKindClasses.push(...themeInfo[t].themeKind);
    });

    const uniqThemeKindClasses = [...new Set(themeKindClasses)];

    document.body.classList.remove(...uniqThemeKindClasses);
    document.body.classList.add(`vscode-${themeInfo[themeName].themeKind}`);
    document.body.dataset.vscodeThemeKind = `vscode-${kind}`;

    themes[themeName] = themes[themeName] || {};

    if (themes[themeName].data) {
      document.documentElement.setAttribute("style", themes[themeName].data);
      return;
    }

    if (!themes[themeName].isFetching) {
      themes[themeName].isFetching = true;

      const theme = await fetchTheme(themeName);

      themes[themeName].isFetching = false;
      themes[themeName].data = theme;
      document.documentElement.setAttribute("style", themes[themeName].data);
    }
  }
}

customElements.define("vscode-dev-toolbar", VscodeDevToolbar);
customElements.define("vscode-demo", VscodeDemo);
