// @ts-check

/**
 * @typedef {"light" | "light-v2" | "dark" | "dark-v2" | "hc-light" | "hc-dark"} ThemeId
 * @typedef {"vscode-light" | "vscode-dark" | "vscode-high-contrast" | "vscode-high-contrast-light"} ThemeKind
 *
 * @typedef  ThemeInfoItem
 * @type {object}
 * @property {ThemeKind} themeKind - Theme kind.
 * @property {string} name - Theme short name.
 * @property {string=} longName - Detailed name of theme.
 *
 * @typedef {Record<ThemeId, ThemeInfoItem>} ThemeInfo
 *
 * @typedef {Record<ThemeId, {data?: [string, string][]; isFetching?: boolean;}>} ThemeRegistry
 */

const html = String.raw;

export const STORAGE_KEY_THEME = "vscode-playground:theme";

/** @param {ThemeInfo} themeInfo */
function getOptionsHTML(themeInfo) {
  let optionsMarkup = "";
  const themeIds = /** @type{ThemeId[]} */ (Object.keys(themeInfo));

  themeIds.forEach((id) => {
    optionsMarkup += html`<option value="${id}">${themeInfo[id].name}</option>`;
  });

  return optionsMarkup;
}

/** @param {ThemeInfo} themeInfo */
function getComponentTemplate(themeInfo) {
  return html`
    <style>
      :host {
        align-items: center;
        display: flex;
        font-family: var(--vscode-font-family, sans-serif);
        font-size: 13px;
      }

      label {
        margin-right: 5px;
      }

      select {
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-foreground);
        color: var(--vscode-foreground);
        font-family: var(--vscode-font-family, sans-serif);
      }

      select:focus-visible {
        outline: 1px solid var(--vscode-focusBorder);
      }
    </style>
    <label for="theme-selector">Theme</label>
    <select id="theme-selector">
      ${getOptionsHTML(themeInfo)}
    </select>
  `;
}

export class VscodeThemeSelector extends HTMLElement {
  /** @type {HTMLTemplateElement} */
  static template;
  /** @type {Set<VscodeThemeSelector>} */
  static instances = new Set();
  /** @type {ThemeInfo} */
  static themeInfo = {
    light: {
      themeKind: "vscode-light",
      name: "Light+",
      longName: "Default Light+",
    },
    "light-v2": {
      themeKind: "vscode-light",
      name: "Light Modern",
      longName: "Default Light Modern",
    },
    dark: {
      themeKind: "vscode-dark",
      name: "Dark+",
      longName: "Default Dark+",
    },
    "dark-v2": {
      themeKind: "vscode-dark",
      name: "Dark Modern",
      longName: "Default Dark Modern",
    },
    "hc-light": {
      themeKind: "vscode-high-contrast-light",
      name: "Light High Contrast",
      longName: "Default High Contrast Light",
    },
    "hc-dark": {
      themeKind: "vscode-high-contrast",
      name: "Dark High Contrast",
      longName: "Default High Contrast",
    },
  };
  /** @type {string} */
  static directoryUrl;
  /** @type {ThemeId} */
  static appliedTheme;
  /** @type {ThemeRegistry} */
  static themes = {
    light: {},
    "light-v2": {},
    dark: {},
    "dark-v2": {},
    "hc-light": {},
    "hc-dark": {},
  };

  #dropdown;

  constructor() {
    super();

    if (!VscodeThemeSelector.template) {
      VscodeThemeSelector.template = document.createElement("template");
      VscodeThemeSelector.template.innerHTML = getComponentTemplate(
        VscodeThemeSelector.themeInfo
      );
    }

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(
      VscodeThemeSelector.template.content.cloneNode(true)
    );

    this.#dropdown = /** @type {HTMLSelectElement} */ (
      this.shadowRoot?.querySelector("#theme-selector")
    );
  }

  connectedCallback() {
    VscodeThemeSelector.instances.add(this);

    this.#dropdown?.addEventListener("change", this.#handleDropdownChange);

    const initialTheme = this.#getInitialTheme();
    this.#applyTheme(initialTheme);
    this.setSelectedOption(initialTheme);
  }

  disconnectedCallback() {
    this.#dropdown?.removeEventListener("change", this.#handleDropdownChange);
    VscodeThemeSelector.instances.delete(this);
  }

  /** @param {ThemeId} value */
  setSelectedOption(value) {
    this.#dropdown.value = value;
  }

  /** @param {boolean} force */
  disableSelector(force) {
    this.#dropdown.disabled = force;
  }

  /**
   * @param {ThemeId} themeId
   * @returns {Promise<{theme: [string, string][]}>}
   */
  async #loadThemeModule(themeId) {
    switch (themeId) {
      case "light":
        return await import(`./themes/light.js`);
      case "light-v2":
        return await import(`./themes/light-v2.js`);
      case "dark":
        return await import(`./themes/dark.js`);
      case "dark-v2":
        return await import(`./themes/dark-v2.js`);
      case "hc-dark":
        return await import(`./themes/hc-dark.js`);
      case "hc-light":
        return await import(`./themes/hc-light.js`);
      default:
        return await import(`./themes/dark-v2.js`);
    }
  }

  /** @param {ThemeId} themeId */
  async #applyTheme(themeId) {
    localStorage.setItem(STORAGE_KEY_THEME, themeId);

    if (themeId === VscodeThemeSelector.appliedTheme) {
      return;
    }

    VscodeThemeSelector.themes[VscodeThemeSelector.appliedTheme]?.data?.forEach(
      (p) => {
        document.documentElement.style.removeProperty(p[0]);
      }
    );
    VscodeThemeSelector.appliedTheme = themeId;

    const { themeKind, name, longName } =
      VscodeThemeSelector.themeInfo[themeId];
    const bodyClasses =
      themeKind === "vscode-high-contrast-light"
        ? ["vscode-high-contrast", "vscode-high-contrast-light"]
        : [themeKind];

    document.body.classList.remove(
      "vscode-light",
      "vscode-dark",
      "vscode-high-contrast",
      "vscode-high-contrast-light"
    );
    document.body.classList.add(...bodyClasses);
    document.body.dataset.vscodeThemeKind = themeKind;
    document.body.dataset.vscodeThemeName = name;
    document.body.dataset.vscodeThemeId = longName;

    VscodeThemeSelector.themes[themeId] =
      VscodeThemeSelector.themes[themeId] || {};

    if (VscodeThemeSelector.themes[themeId].data) {
      this.#setStyles(themeId);
      return;
    }

    if (!VscodeThemeSelector.themes[themeId].isFetching) {
      VscodeThemeSelector.themes[themeId].isFetching = true;

      const module = await this.#loadThemeModule(themeId);

      VscodeThemeSelector.themes[themeId].isFetching = false;
      VscodeThemeSelector.themes[themeId].data = module.theme;
      this.#setStyles(themeId);
    }
  }

  #getDefaultFontStack() {
    if (navigator.userAgent.indexOf("Linux") > -1) {
      return 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
    } else if (navigator.userAgent.indexOf("Mac") > -1) {
      return "-apple-system, BlinkMacSystemFont, sans-serif";
    } else if (navigator.userAgent.indexOf("Windows") > -1) {
      return '"Segoe WPC", "Segoe UI", sans-serif';
    } else {
      return "sans-serif";
    }
  }

  #getDefaultEditorFontStack() {
    if (navigator.userAgent.indexOf("Linux") > -1) {
      return '"Droid Sans Mono", "monospace", monospace';
    } else if (navigator.userAgent.indexOf("Mac") > -1) {
      return 'Menlo, Monaco, "Courier New", monospace';
    } else if (navigator.userAgent.indexOf("Windows") > -1) {
      return 'Consolas, "Courier New", monospace';
    } else {
      return "monospace";
    }
  }

  /** @param {ThemeId} themeId */
  #setStyles(themeId) {
    if (VscodeThemeSelector.themes[themeId].data) {
      VscodeThemeSelector.themes[themeId].data.forEach((p) => {
        document.documentElement.style.setProperty(p[0], p[1]);
      });
    }

    document.documentElement.style.setProperty(
      "--vscode-font-family",
      this.#getDefaultFontStack()
    );
    document.documentElement.style.setProperty(
      "--vscode-editor-font-family",
      this.#getDefaultEditorFontStack()
    );
  }

  #getInitialTheme() {
    const defaultTheme = /** @type {ThemeId} */ (
      Object.keys(VscodeThemeSelector.themeInfo)[0]
    );
    let selectedTheme = defaultTheme;
    const theme = localStorage.getItem(STORAGE_KEY_THEME);

    if (theme && theme in VscodeThemeSelector.themeInfo) {
      selectedTheme = /** @type {ThemeId} */ (theme);
    }

    return selectedTheme;
  }

  /** @param {ThemeId} theme */
  #syncInstances(theme) {
    VscodeThemeSelector.instances.forEach((selector) => {
      if (selector !== this) {
        selector.setSelectedOption(theme);
      }
    });
  }

  #handleDropdownChange = () => {
    const theme = /** @type {ThemeId} */ (this.#dropdown.value);

    this.#applyTheme(theme).then(() => {
      this.#syncInstances(theme);
    });
  };
}
