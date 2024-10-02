// @ts-check

/**
 * @typedef {"light" | "light-v2" | "dark" | "dark-v2" | "hc-light" | "hc-dark" } ThemeId
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
 *
 * @typedef {Record<ThemeId, {data?: [string, string][]; isFetching?: boolean;}>} ThemeRegistry
 */

const html = String.raw;

export const STORAGE_KEY_THEME = "vscode-playground:theme";

/**
 * @param {ThemeInfo} themeInfo
 */
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
        font-family: var(--vscode-font-family, sans-serif);
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
   */
  async #applyTheme(themeId) {
    if (themeId === VscodeThemeSelector.appliedTheme) {
      return;
    }

    VscodeThemeSelector.themes[VscodeThemeSelector.appliedTheme]?.data?.forEach(
      (p) => {
        document.documentElement.style.removeProperty(p[0]);
      }
    );

    VscodeThemeSelector.appliedTheme = themeId;

    const themeKeys = /** @type {ThemeId[]} */ (
      Object.keys(VscodeThemeSelector.themeInfo)
    );
    const allAvailableBodyClasses = [];

    themeKeys.forEach((t) => {
      VscodeThemeSelector.themeInfo[t].bodyClasses.forEach((tk) => {
        allAvailableBodyClasses.push(tk);
      });
    });

    const uniqBodyClasses = [...new Set(allAvailableBodyClasses)];

    document.body.classList.remove(...uniqBodyClasses);
    document.body.classList.add(
      ...VscodeThemeSelector.themeInfo[themeId].bodyClasses
    );
    document.body.dataset.vscodeThemeKind =
      VscodeThemeSelector.themeInfo[themeId].themeKind;
    document.body.dataset.vscodeThemeName =
      VscodeThemeSelector.themeInfo[themeId].name;
    document.body.dataset.vscodeThemeId =
      VscodeThemeSelector.themeInfo[themeId].longName;

    VscodeThemeSelector.themes[themeId] =
      VscodeThemeSelector.themes[themeId] || {};

    if (VscodeThemeSelector.themes[themeId].data) {
      this.#setStyles(themeId);
      return;
    }

    if (!VscodeThemeSelector.themes[themeId].isFetching) {
      VscodeThemeSelector.themes[themeId].isFetching = true;
      
      const { theme } =
        await /** @type {Promise<{theme: [string, string][]}>} */ (
          import(`./themes/${themeId}.js`)
        );

      VscodeThemeSelector.themes[themeId].isFetching = false;
      VscodeThemeSelector.themes[themeId].data = theme;
      this.#setStyles(themeId);
    }

    localStorage.setItem(STORAGE_KEY_THEME, themeId);
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

  /**
   * @param {boolean} force
   */
  #disableAllSelectors(force) {
    VscodeThemeSelector.instances.forEach((s) => {
      s.disableSelector(force);
    });
  }

  #handleDropdownChange = () => {
    const theme = /** @type {ThemeId} */ (this.#dropdown.value);

    this.#disableAllSelectors(true);

    this.#applyTheme(theme).then(() => {
      this.#syncInstances(theme);
      this.#disableAllSelectors(false);
    });
  };
}
