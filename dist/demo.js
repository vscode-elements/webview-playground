// @ts-check

const html = String.raw;

/** @typedef {import("./shared.js").ThemeId} ThemeId */

function getComponentTemplate() {
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
        <vscode-theme-selector></vscode-theme-selector>
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

export class VscodeDemo extends HTMLElement {
  /** @type {HTMLTemplateElement} */
  static template;

  /** @type {HTMLDivElement | null} */
  _elThemeSelector = null;
  /** @type {NodeListOf<HTMLButtonElement> | null} */
  _elButtons = null;
  /** @type {HTMLButtonElement | null} */
  _elToggleFullscreen = null;

  constructor() {
    super();

    if (!VscodeDemo.template) {
      VscodeDemo.template = document.createElement("template");
      VscodeDemo.template.innerHTML = getComponentTemplate();
    }

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(VscodeDemo.template.content.cloneNode(true));

    this._elThemeSelector = shadowRoot.querySelector(".theme-selector");
    this._elToggleFullscreen =
      this._elThemeSelector?.querySelector(".toggle-fullscreen-button") ?? null;
  }

  connectedCallback() {
    this._elToggleFullscreen?.addEventListener(
      "click",
      this._onToggleFullscreenButtonClick
    );
  }

  disconnectedCallback() {
    this._elToggleFullscreen?.removeEventListener(
      "click",
      this._onToggleFullscreenButtonClick
    );
  }

  _onToggleFullscreenButtonClick = () => {
    if (!this.hasAttribute("fullscreen")) {
      this.setAttribute("fullscreen", "");
    } else {
      this.removeAttribute("fullscreen");
    }
  };
}
