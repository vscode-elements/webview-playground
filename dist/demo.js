// @ts-check

import { getDefaultStylesCSS } from "./shared.js";

const html = String.raw;
const css = String.raw;

const LIGHT_DOM_STYLE_ID = "_vscodeDemoStyles";

const styles = new CSSStyleSheet();
styles.replaceSync(css`
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
    background-color: var(--playground-body-background);
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

  .header-wrapper {
    position: relative;
  }

  .header {
    align-items: center;
    background-color: var(--playground-body-background);
    box-sizing: border-box;
    color: var(--vscode-editor-foreground);
    display: flex;
    font-family: var(--vscode-font-family, sans-serif);
    font-size: 13px;
    flex-wrap: wrap;
    height: 35px;
    padding: 0 10px;
    position: relative;
    width: 100%;
  }

  .menu-wrapper {
    position: relative;
  }

  .toggle-menu-button {
    background-color: transparent;
    border: 0;
    border-radius: 5px;
    box-sizing: content-box;
    color: var(--vscode-editor-foreground);
    cursor: pointer;
    display: block;
    height: 16px;
    margin: 0 0 0 2px;
    padding: 3px;
    width: 16px;
  }

  .toggle-menu-button:focus {
    outline: 1px solid var(--vscode-focusBorder);
  }

  .toggle-menu-button:hover {
    background-color: var(--vscode-toolbar-hoverBackground);
  }

  .toggle-menu-button.active {
    background-color: var(--vscode-toolbar-activeBackground);
  }

  .toggle-menu-button svg {
    display: block;
    height: 16px;
    width: 16px;
  }

  .menu {
    background-color: #fff;
    border: 1px solid #cdcdcd;
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    color: #000;
    display: none;
    left: 1px;
    padding: 10px;
    position: absolute;
    top: 24px;
    z-index: 100;
  }

  .menu.open {
    display: block;
  }

  fieldset {
    border: 1px solid #e7e7e7;
    border-radius: 5px;
    margin-top: 5px;
    padding: 10px;
  }

  .row {
    align-items: center;
    display: flex;
    margin: 0 0 10px 0;
  }

  .row:last-child {
    margin-bottom: 0;
  }

  .header .toggle-fullscreen-button {
    align-items: center;
    background-color: transparent;
    border: 0;
    border-radius: 5px;
    color: var(--vscode-editor-foreground);
    cursor: pointer;
    display: flex;
    justify-content: center;
    margin-left: auto;
    padding: 5px;
  }

  .header .toggle-fullscreen-button .normal {
    display: none;
  }

  :host([fullscreen]) .toggle-fullscreen-button .normal {
    display: block;
  }

  :host([fullscreen]) .toggle-fullscreen-button .full {
    display: none;
  }

  .header .toggle-fullscreen-button:focus {
    outline: none;
  }

  .header .toggle-fullscreen-button:focus {
    outline: 1px solid var(--vscode-focusBorder);
  }
`);

function getComponentTemplate() {
  return html`
    <div class="header-wrapper">
      <div id="header" class="header" part="header">
        <vscode-theme-selector></vscode-theme-selector>
        <div class="menu-wrapper">
          <button
            type="button"
            class="toggle-menu-button"
            id="toggle-menu"
            title="Open menu"
            part="toggle-menu"
          >
            <svg
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.444 13.832a1 1 0 1 0 1.111-1.663 1 1 0 0 0-1.11 1.662zM8 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0-5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
              />
            </svg>
          </button>
          <div id="menu" class="menu" part="menu">
            <vscode-view-container-selector></vscode-view-container-selector>
            <fieldset>
              <legend>User preferences</legend>
              <div class="row">
                <vscode-toggle-underline></vscode-toggle-underline>
              </div>
              <div class="row">
                <vscode-toggle-motion></vscode-toggle-motion>
              </div>
            </fieldset>
          </div>
        </div>
        <button
          type="button"
          class="toggle-fullscreen-button"
          id="toggle-fullscreen"
          title="toggle fullscreen"
          part="toggle-fullscreen"
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
    <div class="canvas" part="canvas">
      <slot></slot>
    </div>
  `;
}

export class VscodeDemo extends HTMLElement {
  /** @type {HTMLTemplateElement} */
  static template;

  /** @type {HTMLDivElement | null} */
  #header = null;
  /** @type {HTMLDivElement | null} */
  #menu = null;
  /** @type {HTMLButtonElement | null} */
  #toggleFullScreen = null;
  /** @type {HTMLButtonElement | null} */
  #toggleMenuButton = null;

  constructor() {
    super();

    if (!VscodeDemo.template) {
      VscodeDemo.template = document.createElement("template");
      VscodeDemo.template.innerHTML = getComponentTemplate();
    }

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.adoptedStyleSheets.push(styles);
    shadowRoot.appendChild(VscodeDemo.template.content.cloneNode(true));

    this.#header = shadowRoot.querySelector("#header");
    this.#menu = shadowRoot.querySelector(".menu");
    this.#toggleFullScreen =
      this.#header?.querySelector("#toggle-fullscreen") ?? null;
    this.#toggleMenuButton = shadowRoot.querySelector("#toggle-menu");
    this.dataset.vscodeDemo = "";
  }

  connectedCallback() {
    this.#toggleFullScreen?.addEventListener(
      "click",
      this.#onToggleFullscreenButtonClick
    );
    this.#toggleMenuButton?.addEventListener("click", this.#onMenuButtonClick);
    this.#applyLightDomStyles();
  }

  disconnectedCallback() {
    this.#toggleFullScreen?.removeEventListener(
      "click",
      this.#onToggleFullscreenButtonClick
    );
    this.#toggleMenuButton?.removeEventListener(
      "click",
      this.#onMenuButtonClick
    );
  }

  #applyLightDomStyles() {
    if (!document.getElementById(LIGHT_DOM_STYLE_ID)) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("id", LIGHT_DOM_STYLE_ID);
      styleElement.innerHTML = getDefaultStylesCSS(
        "vscode-demo[data-vscode-demo] "
      );

      // @ts-ignore
      if (window?.vscodeWebviewPlaygroundNonce) {
        // @ts-ignore
        styleElement.setAttribute('nonce', window.vscodeWebviewPlaygroundNonce);
      }

      document.head.appendChild(styleElement);
    }
  }

  #onToggleFullscreenButtonClick = () => {
    if (!this.hasAttribute("fullscreen")) {
      this.setAttribute("fullscreen", "");
    } else {
      this.removeAttribute("fullscreen");
    }
  };

  /** @param {MouseEvent} ev */
  #onMenuButtonClick = (ev) => {
    ev.stopPropagation();

    if (this.#menu?.classList.contains("open")) {
      this.#menu?.classList.toggle("open", false);
      this.#toggleMenuButton?.classList.toggle("active", false);
      window.removeEventListener("click", this.#onWindowClick);
    } else {
      this.#menu?.classList.toggle("open", true);
      this.#toggleMenuButton?.classList.toggle("active", true);
      window.addEventListener("click", this.#onWindowClick);
    }
  };

  /** @param {MouseEvent} ev */
  #onWindowClick = (ev) => {
    if (ev.target) {
      const path = ev.composedPath();
      const menuClicked = !!path.find((e) => e === this.#menu);
      const buttonClicked = !!path.find((e) => e === this.#toggleMenuButton);

      if (!menuClicked || buttonClicked) {
        ev.stopPropagation();
        this.#menu?.classList.toggle("open", false);
        this.#toggleMenuButton?.classList.toggle("active", false);
        window.removeEventListener("click", this.#onWindowClick);
      }
    }
  };
}
