// @ts-check

import {
  activeToolbarInstance,
  applyTheme,
  getDefaultStylesCSS,
  getInitialTheme,
  getToolbarTemplateHTML,
  setActiveDemoTabs,
  setActiveToolbarInstance,
  setAllDemoTabsDisabled,
  STORAGE_KEY_SHOW_UI,
  STORAGE_KEY_THEME,
  themeInfo,
} from "./shared.js";

/** @typedef {import("./shared.js").ThemeId} ThemeId */

const DEFAULT_STYLES_ID = "_defaultStyles";
const ATTR_SHOW_UI = "show-ui";

const toolbarTemplate = document.createElement("template");
toolbarTemplate.innerHTML = getToolbarTemplateHTML();

export class VscodeDevToolbar extends HTMLElement {
  static observedAttributes = [ATTR_SHOW_UI];

  constructor() {
    super();

    if (activeToolbarInstance) {
      return;
    }

    setActiveToolbarInstance(this);

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(toolbarTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      return;
    }

    this._openButton = /** @type {HTMLButtonElement | null} */ (
      this.shadowRoot?.querySelector(".open-toolbar-button")
    );
    this._closeButton = /** @type {HTMLButtonElement| null} */ (
      this.shadowRoot?.querySelector(".close-toolbar-button")
    );
    this._panel = /** @type {HTMLDivElement | null} */ (
      this.shadowRoot?.querySelector(".panel")
    );
    this._themeSelector = /** @type {HTMLSelectElement | null} */ (
      this.shadowRoot?.querySelector("#theme-selector")
    );

    this._openButton?.addEventListener("click", this._onOpenToolbarButtonClick);
    this._closeButton?.addEventListener(
      "click",
      this._onCloseToolbarButtonClick
    );
    this._themeSelector?.addEventListener(
      "change",
      this._onThemeSelectorChange
    );

    const initialTheme = getInitialTheme();

    if (this._themeSelector) {
      this._themeSelector.value = initialTheme;
    }

    applyTheme(initialTheme).then(() => {
      setActiveDemoTabs(initialTheme);
    });
    this._applyDefaultStyles();

    const savedUiState = localStorage.getItem(STORAGE_KEY_SHOW_UI);

    if (savedUiState === null) {
      this._showUi(true);
    } else {
      this._showUi(savedUiState === "true");
    }
  }

  disconnectedCallback() {
    this._openButton?.removeEventListener(
      "click",
      this._onOpenToolbarButtonClick
    );
    this._closeButton?.removeEventListener(
      "click",
      this._onCloseToolbarButtonClick
    );
    this._themeSelector?.removeEventListener(
      "change",
      this._onThemeSelectorChange
    );
  }

  /**
   *
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, newValue, this.hasAttribute(ATTR_SHOW_UI));
    if (name === ATTR_SHOW_UI) {
      this._showUi(this.hasAttribute(ATTR_SHOW_UI));
    }
  }

  /** @param {ThemeId} value */
  setThemeSelector(value) {
    if (this._themeSelector) {
      this._themeSelector.value = value;
    }
  }

  /** @param {boolean} force */
  set showUi(force) {
    if (Boolean(force)) {
      this.setAttribute(ATTR_SHOW_UI, "");
    } else {
      this.removeAttribute(ATTR_SHOW_UI);
    }

    this._showUi(Boolean(force));
  }

  /** @returns {boolean} */
  get showUi() {
    return this.hasAttribute(ATTR_SHOW_UI);
  }

  /** @param {boolean} force */
  _showUi(force) {
    const ui = this.shadowRoot?.querySelector(".ui");

    if (force) {
      ui?.classList.add("show");
    } else {
      ui?.classList.remove("show");
    }

    localStorage.setItem(STORAGE_KEY_SHOW_UI, force.toString());
  }

  _applyDefaultStyles() {
    const defaultStyles = document.getElementById(DEFAULT_STYLES_ID);

    if (!defaultStyles) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("id", DEFAULT_STYLES_ID);
      styleElement.innerHTML = getDefaultStylesCSS();
      document.head.appendChild(styleElement);
    }
  }

  _onOpenToolbarButtonClick = () => {
    this._panel?.classList.add("open");
    this._openButton?.classList.add("open");
  };

  _onCloseToolbarButtonClick = () => {
    this._panel?.classList.remove("open");
    this._openButton?.classList.remove("open");
  };

  _onThemeSelectorChange = () => {
    const themeKeys = Object.keys(themeInfo);
    const value = /** @type {ThemeId} */ (
      this._themeSelector?.value ?? themeKeys[0]
    );

    setActiveDemoTabs(value);
    setAllDemoTabsDisabled(true);

    applyTheme(value).then(() => {
      setAllDemoTabsDisabled(false);
    });

    localStorage.setItem(STORAGE_KEY_THEME, value);
  };

  _onLocationSelectorChange = () => {};

  _onToggleUnderlineChange = () => {};

  _onToggleReduceMotionChange = () => {};
}
