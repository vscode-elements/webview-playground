// @ts-check

import {
  applyTheme,
  getInitialTheme,
  getToolbarTemplateHTML,
  setActiveDemoTabs,
  setToolbarInstanceCounter,
  toolbarInstanceCounter,
} from "./shared.js";

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

    this._openButton.addEventListener("click", this._onOpenToolbarButtonClick);
    this._closeButton.addEventListener("click", this._onCloseToolbarButtonClick);

    const initialTheme = getInitialTheme();

    applyTheme(initialTheme).then(() => {
      setActiveDemoTabs(initialTheme);
    });
  }

  disconnectedCallback() {
    this._openButton?.removeEventListener("click", this._onOpenToolbarButtonClick);
    this._closeButton?.removeEventListener("click", this._onCloseToolbarButtonClick);
  }

  _onOpenToolbarButtonClick = () => {
    this._panel?.classList.add('open');
    this._openButton?.classList.add('open');
  };

  _onCloseToolbarButtonClick = () => {
    this._panel?.classList.remove('open');
    this._openButton?.classList.remove('open');
  };
}
