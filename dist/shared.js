// @ts-check

/**
 * @typedef {import("./toolbar.js").VscodeDevToolbar} VscodeDevToolbar
 *
 * @typedef {"light" | "light-v2" | "dark" | "dark-v2" | "hc-light" | "hc-dark" } ThemeId
 *
 * @typedef {Record<ThemeId, {data?: string; isFetching?: boolean;}>} ThemeRegistry
 *
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

export const STORAGE_KEY_PREFIX = "vscode-webview-playground";
export const STORAGE_KEY_THEME = `${STORAGE_KEY_PREFIX}_theme`;
export const STORAGE_KEY_UNDERLINE_LINKS = `${STORAGE_KEY_PREFIX}_underline-links`;
export const STORAGE_KEY_REDUCE_MOTION = `${STORAGE_KEY_PREFIX}_reduce-motion`;
export const TOOLBAR_TAG_NAME = "vscode-dev-toolbar";
export const DEMO_TAG_NAME = "vscode-demo";

const html = String.raw;
const css = String.raw;

/** @type {ThemeId} */
let appliedTheme;

/** Calculated url of the script directory base on the `import.meta` property. */
// TODO: Use import.meta.resolve()
let directoryUrl;

/** Demo component instance counter */
export let demoInstanceCounter = 0;

export const setDemoInstanceCounter = (/** @type {number} */ newVal) => {
  demoInstanceCounter = newVal;
};

/** @type {{[key: string]: HTMLDivElement | null}} */
export let themeSelectorInstances = {};

/** @param {{[key: string]: HTMLDivElement | null}} newVal */
export const setThemeSelectorInstances = (newVal) => {
  themeSelectorInstances = newVal;
};

/** @type {VscodeDevToolbar | null} */
export let activeToolbarInstance = null;

/** @param {VscodeDevToolbar} toolbar */
export const setActiveToolbarInstance = (toolbar) => {
  activeToolbarInstance = toolbar;
};

/** @type {ThemeRegistry} */
const themes = {
  light: {},
  "light-v2": {},
  dark: {},
  "dark-v2": {},
  "hc-light": {},
  "hc-dark": {},
};

/** @type {ThemeInfo} */
export const themeInfo = {
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
 * @param {ThemeId} themeId
 */
export async function applyTheme(themeId) {
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

export function getInitialTheme() {
  const defaultTheme = /** @type {ThemeId} */ (Object.keys(themeInfo)[0]);
  let selectedTheme = defaultTheme;
  const theme = localStorage.getItem(STORAGE_KEY_THEME);

  if (theme && theme in themeInfo) {
    selectedTheme = /** @type {ThemeId} */ (theme);
  }

  return selectedTheme;
}

/**
 * @param {ThemeId} theme
 */
export function setActiveDemoTabs(theme) {
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
export function setAllDemoTabsDisabled(disabled) {
  const instanceKeys = Object.keys(themeSelectorInstances);

  instanceKeys.forEach((k) => {
    themeSelectorInstances[k]?.querySelectorAll("button").forEach((b) => {
      b.disabled = disabled;
    });
  });
}

const logoSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.435 73.998">
    <g fill="#007acc">
      <path d="M115.89 8.141L100.762.857a4.574 4.574 0 00-5.23.89L66.537 28.2l-12.63-9.584a3.042 3.042 0 00-3.908.173l-4.051 3.678a3.067 3.067 0 00-.015 4.526l10.963 10-10.963 10a3.067 3.067 0 00.015 4.526l4.051 3.692c1.107.992 2.745 1.064 3.908.173l12.63-9.584L95.53 72.251a4.552 4.552 0 005.216.89l15.144-7.284a4.576 4.576 0 002.6-4.138V12.28a4.552 4.552 0 00-2.6-4.138zm-15.761 45.56l-22.012-16.71 22.012-16.709zM134.34 0l-7.81 7.81L155.73 37l-29.2 29.188 7.81 7.81 33.095-33.094v-7.81zM40.904 7.81L11.704 37l29.2 29.188-7.81 7.81L0 40.904v-7.81L33.094 0z">
      </path>
    </g>
  </svg>`;

function getToolbarThemeSelectorOptionsHTML() {
  const keys = Object.keys(themeInfo);

  return keys.reduce((previousValue, _currentValue, i, arr) => {
    const id = arr[i];
    const { name } = /** @type {ThemeInfoItem} */ (themeInfo[id]);

    return html`${previousValue}
      <option value="${id}">${name}</option>`;
  }, "");
}

export function getDefaultStylesCSS() {
  return css`
    html {
      scrollbar-color: var(--vscode-scrollbarSlider-background)
        var(--vscode-editor-background);
    }

    body {
      overscroll-behavior-x: none;
      background-color: transparent;
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-weight: var(--vscode-font-weight);
      font-size: var(--vscode-font-size);
      margin: 0;
      padding: 0 20px;
    }

    img,
    video {
      max-width: 100%;
      max-height: 100%;
    }

    a,
    a code {
      color: var(--vscode-textLink-foreground);
    }

    p > a {
      text-decoration: var(--text-link-decoration);
    }

    a:hover {
      color: var(--vscode-textLink-activeForeground);
    }

    a:focus,
    input:focus,
    select:focus,
    textarea:focus {
      outline: 1px solid -webkit-focus-ring-color;
      outline-offset: -1px;
    }

    code {
      font-family: var(--monaco-monospace-font);
      color: var(--vscode-textPreformat-foreground);
      background-color: var(--vscode-textPreformat-background);
      padding: 1px 3px;
      border-radius: 4px;
    }

    pre code {
      padding: 0;
    }

    blockquote {
      background: var(--vscode-textBlockQuote-background);
      border-color: var(--vscode-textBlockQuote-border);
    }

    kbd {
      background-color: var(--vscode-keybindingLabel-background);
      color: var(--vscode-keybindingLabel-foreground);
      border-style: solid;
      border-width: 1px;
      border-radius: 3px;
      border-color: var(--vscode-keybindingLabel-border);
      border-bottom-color: var(--vscode-keybindingLabel-bottomBorder);
      box-shadow: inset 0 -1px 0 var(--vscode-widget-shadow);
      vertical-align: middle;
      padding: 1px 3px;
    }

    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-corner {
      background-color: var(--vscode-editor-background);
    }

    ::-webkit-scrollbar-thumb {
      background-color: var(--vscode-scrollbarSlider-background);
    }
    ::-webkit-scrollbar-thumb:hover {
      background-color: var(--vscode-scrollbarSlider-hoverBackground);
    }
    ::-webkit-scrollbar-thumb:active {
      background-color: var(--vscode-scrollbarSlider-activeBackground);
    }
    ::highlight(find-highlight) {
      background-color: var(--vscode-editor-findMatchHighlightBackground);
    }
    ::highlight(current-find-highlight) {
      background-color: var(--vscode-editor-findMatchBackground);
    }
  `;
}

/**
 * @returns {string}
 */
export function getToolbarTemplateHTML() {
  return html`
    <style>
      :host {
        bottom: 30px;
        font-family: sans-serif;
        font-size: 14px;
        position: fixed;
        right: 30px;
      }

      label {
        user-select: none;
      }

      .open-toolbar-button {
        background-color: #fff;
        border: 1px solid #cdcdcd;
        border-radius: 12px;
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        height: 42px;
        padding: 4px;
        width: 42px;
      }

      .open-toolbar-button.open {
        display: none;
      }

      .open-toolbar-button svg {
        display: block;
        height: 100%;
        width: 100%;
      }

      .close-toolbar-button {
        background-color: transparent;
        border: none;
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        padding: 4px;
        position: absolute;
        right: 3px;
        top: 3px;
      }

      .close-toolbar-button svg {
        display: block;
        height: 16px;
        width: 16px;
      }

      .panel {
        background-color: #fff;
        border: 1px solid #cdcdcd;
        border-radius: 12px;
        color: #000;
        display: none;
        padding: 10px;
        position: relative;
      }

      fieldset {
        border: 1px solid #e7e7e7;
        border-radius: 5px;
        padding: 10px;
      }

      .row {
        align-items: center;
        display: flex;
        margin: 10px 0;
      }

      .row:first-child {
        margin-top: 0;
      }

      .row:last-child {
        margin-bottom: 0;
      }

      .row.select label {
        text-align: right;
        width: 80px;
      }

      .row.select select {
        width: 150px;
      }

      select {
        margin-left: 5px;
      }

      input[type="checkbox"] {
        margin: 0 5px 0 0;
      }

      .panel.open {
        display: block;
      }
    </style>
    <div>
      <button type="button" title="Open toolbar" class="open-toolbar-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 167.435 73.998"
          role="img"
        >
          <title>Open toolbar</title>
          <g fill="#007acc">
            <path
              d="M115.89 8.141L100.762.857a4.574 4.574 0 00-5.23.89L66.537 28.2l-12.63-9.584a3.042 3.042 0 00-3.908.173l-4.051 3.678a3.067 3.067 0 00-.015 4.526l10.963 10-10.963 10a3.067 3.067 0 00.015 4.526l4.051 3.692c1.107.992 2.745 1.064 3.908.173l12.63-9.584L95.53 72.251a4.552 4.552 0 005.216.89l15.144-7.284a4.576 4.576 0 002.6-4.138V12.28a4.552 4.552 0 00-2.6-4.138zm-15.761 45.56l-22.012-16.71 22.012-16.709zM134.34 0l-7.81 7.81L155.73 37l-29.2 29.188 7.81 7.81 33.095-33.094v-7.81zM40.904 7.81L11.704 37l29.2 29.188-7.81 7.81L0 40.904v-7.81L33.094 0z"
            ></path>
          </g>
        </svg>
      </button>
      <div class="panel">
        <div class="row select">
          <label for="theme-selector">Theme</label>
          <select id="theme-selector">
            ${getToolbarThemeSelectorOptionsHTML()}
          </select>
        </div>
        <div class="row select">
          <label for="location-selector">Location</label>
          <select id="location-selector">
            <option value="editor">Editor</option>
            <option value="sidebar">Sidebar</option>
            <option value="panel">Panel</option>
          </select>
        </div>
        <fieldset>
          <legend>User preferences</legend>
          <div>
            <div class="row">
              <input type="checkbox" id="toggle-underline" />
              <label for="toggle-underline"
                >Underline links
                <span>(accessibility.underlineLinks)</span></label
              >
            </div>
            <div class="row">
              <input type="checkbox" id="toggle-reduce-motion" />
              <label for="toggle-reduce-motion"
                >Reduce motion <span>(workbench.reduceMotion)</span></label
              >
            </div>
          </div>
        </fieldset>
        <button
          type="button"
          class="close-toolbar-button"
          title="Close toolbar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <title>Close toolbar</title>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"
            />
          </svg>
        </button>
      </div>
    </div>
  `;
}

function getDemoTabHeadersHTML() {
  const keys = Object.keys(themeInfo);

  return keys.reduce((previousValue, _currentValue, i, arr) => {
    const title = themeInfo[arr[i]].description;
    const label = themeInfo[arr[i]].label;

    return `${previousValue}<button title="${title}" value="${arr[i]}" class="theme-button">${label}</button>`;
  }, "");
}

export function getDemoTemplateHTML() {
  return html`
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
        content: "";
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
        color: var(--toolbar-active, #007acc);
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
        <button
          type="button"
          class="toggle-fullscreen-button"
          id="toggle-fullscreen"
          title="toggle fullscreen"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="full"
          >
            <path
              d="M3 12h10V4H3v8zm2-6h6v4H5V6zM2 6H1V2.5l.5-.5H5v1H2v3zm13-3.5V6h-1V3h-3V2h3.5l.5.5zM14 10h1v3.5l-.5.5H11v-1h3v-3zM2 13h3v1H1.5l-.5-.5V10h1v3z"
            />
          </svg>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="normal"
          >
            <path
              d="M3.5 4H1V3h2V1h1v2.5l-.5.5zM13 3V1h-1v2.5l.5.5H15V3h-2zm-1 9.5V15h1v-2h2v-1h-2.5l-.5.5zM1 12v1h2v2h1v-2.5l-.5-.5H1zm11-1.5l-.5.5h-7l-.5-.5v-5l.5-.5h7l.5.5v5zM10 7H6v2h4V7z"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="canvas">
      <slot></slot>
    </div>
  `;
}
