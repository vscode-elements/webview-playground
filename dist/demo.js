// @ts-check

const html = String.raw;

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

      .header-wrapper {
        position: relative;
      }

      .header {
        align-items: center;
        background-color: var(--toolbar-background, #fff);
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        padding: 10px;
        position: relative;
        width: 100%;
        z-index: 2;
      }

      .header:after {
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

      .header button:focus-visible span {
        outline: 1px solid var(--toolbar-active, #007acc);
      }

      .menu-wrapper {
        position: relative;
      }

      .toggle-menu-button {
        background-color: transparent;
        border: 0;
        border-radius: 3px;
        cursor: pointer;
        display: block;
        margin: 0 0 0 2px;
        padding: 3px;
      }

      .toggle-menu-button.active {
        background-color: rgba(166, 166, 166, 0.31);
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
        display: none;
        left: 1px;
        padding: 10px;
        position: absolute;
        top: 24px;
        width: 200px;
        z-index: 3;
      }

      .menu.open {
        display: block;
      }

      .header .toggle-fullscreen-button {
        align-items: center;
        background-color: transparent;
        border: 0;
        color: var(--toolbar-normal, #24292e);
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

      .header .toggle-fullscreen-button:focus-visible {
        outline: 1px solid var(--toolbar-active, #007acc);
      }
    </style>
    <div class="header-wrapper">
      <div id="header" class="header">
        <vscode-theme-selector></vscode-theme-selector>
        <div class="menu-wrapper">
          <button
            type="button"
            class="toggle-menu-button"
            id="toggle-menu"
            title="Open menu"
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
          <div class="menu">
            <vscode-view-container-selector></vscode-view-container-selector>
          </div>
        </div>
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
    shadowRoot.appendChild(VscodeDemo.template.content.cloneNode(true));

    this.#header = shadowRoot.querySelector("#header");
    this.#menu = shadowRoot.querySelector(".menu");
    this.#toggleFullScreen =
      this.#header?.querySelector("#toggle-fullscreen") ?? null;
    this.#toggleMenuButton = shadowRoot.querySelector("#toggle-menu");
  }

  connectedCallback() {
    this.#toggleFullScreen?.addEventListener(
      "click",
      this.#onToggleFullscreenButtonClick
    );
    this.#toggleMenuButton?.addEventListener("click", this.#onMenuButtonClick);
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

  #onToggleFullscreenButtonClick = () => {
    if (!this.hasAttribute("fullscreen")) {
      this.setAttribute("fullscreen", "");
    } else {
      this.removeAttribute("fullscreen");
    }
  };

  #onMenuButtonClick = () => {
    this.#menu?.classList.toggle("open");
    this.#toggleMenuButton?.classList.toggle("active");
  };
}
