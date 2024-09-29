// @ts-check

import {
  applyTheme,
  getInitialTheme,
  getToolbarTemplateHTML,
  setActiveDemoTabs,
  setAllDemoTabsDisabled,
  setToolbarInstanceCounter,
  STORAGE_KEY_THEME,
  themeInfo,
  toolbarInstanceCounter,
} from "./shared.js";

/** @typedef {import("./shared.js").ThemeId} ThemeId */

const toolbarTemplate = document.createElement("template");
toolbarTemplate.innerHTML = getToolbarTemplateHTML();

export class VscodeDevToolbar extends HTMLElement {
  constructor() {
    super();

    if (toolbarInstanceCounter > 0) {
      return;
    }

    setToolbarInstanceCounter(toolbarInstanceCounter + 1);

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(toolbarTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this._openButton = /** @type {HTMLButtonElement} */ (
      this.shadowRoot?.querySelector(".open-toolbar-button")
    );
    this._closeButton = /** @type {HTMLButtonElement} */ (
      this.shadowRoot?.querySelector(".close-toolbar-button")
    );
    this._panel = /** @type {HTMLDivElement} */ (
      this.shadowRoot?.querySelector(".panel")
    );
    this._themeSelector = /** @type {HTMLSelectElement} */ (
      this.shadowRoot?.querySelector("#theme-selector")
    );

    this._openButton.addEventListener("click", this._onOpenToolbarButtonClick);
    this._closeButton.addEventListener(
      "click",
      this._onCloseToolbarButtonClick
    );
    this._themeSelector.addEventListener("change", this._onThemeSelectorChange);

    const initialTheme = getInitialTheme();
    this._themeSelector.value = initialTheme;
    
    applyTheme(initialTheme).then(() => {
      setActiveDemoTabs(initialTheme);
    });
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
