// @ts-check

import {
  applyTheme,
  demoInstanceCounter,
  getDemoTemplateHTML,
  getInitialTheme,
  setActiveDemoTabs,
  setAllDemoTabsDisabled,
  setDemoInstanceCounter,
  setThemeSelectorInstances,
  STORAGE_KEY_THEME,
  themeSelectorInstances,
} from "./shared.js";

/** @typedef {import("./shared.js").ThemeId} ThemeId */

const demoTemplate = document.createElement("template");
demoTemplate.innerHTML = getDemoTemplateHTML();

export class VscodeDemo extends HTMLElement {
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
    setDemoInstanceCounter(demoInstanceCounter + 1);
    const instances = themeSelectorInstances;
    instances[`instance-${demoInstanceCounter}`] = this._elThemeSelector;
    setThemeSelectorInstances(instances);

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
