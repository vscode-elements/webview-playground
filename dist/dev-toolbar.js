// @ts-check

const html = String.raw;
const css = String.raw;

const DEFAULT_STYLES_ID = "_defaultStyles";
const ATTR_HIDDEN = "hidden";
const STORAGE_KEY_HIDE_UI = "vscode-playground:dev-toolbar-hidden";

function getDefaultStylesCSS() {
  return css`
    html {
      scrollbar-color: var(--vscode-scrollbarSlider-background)
        var(--vscode-editor-background);
    }

    body {
      overscroll-behavior-x: none;
      background-color: var(--playground-body-background);
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
function getComponentTemplate() {
  return html`
    <style>
      :host {
        bottom: 30px;
        font-family: sans-serif;
        font-size: 14px;
        position: fixed;
        right: 30px;
        z-index: 1000;
      }

      .ui {
        display: block;
      }

      .ui.hidden {
        display: none;
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

      vscode-toggle-underline::part(checkbox),
      vscode-toggle-motion::part(checkbox) {
        margin-top: 0;
      }

      .row {
        align-items: center;
        display: flex;
        margin: 0 0 10px;
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
    <div class="ui">
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
          <vscode-theme-selector></vscode-theme-selector>
        </div>
        <div class="row select">
          <vscode-view-container-selector></vscode-view-container-selector>
        </div>
        <fieldset>
          <legend>User preferences</legend>
          <div>
            <div class="row">
              <vscode-toggle-underline></vscode-toggle-underline>
            </div>
            <div class="row">
              <vscode-toggle-motion></vscode-toggle-motion>
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

export class VscodeDevToolbar extends HTMLElement {
  static observedAttributes = [ATTR_HIDDEN];

  /** @type {HTMLTemplateElement} */
  static template;

  /** @type {VscodeDevToolbar | null} */
  static activeInstance = null;

  constructor() {
    super();

    if (VscodeDevToolbar.activeInstance) {
      return;
    }

    VscodeDevToolbar.activeInstance = this;

    if (!VscodeDevToolbar.template) {
      VscodeDevToolbar.template = document.createElement("template");
      VscodeDevToolbar.template.innerHTML = getComponentTemplate();
    }

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(VscodeDevToolbar.template.content.cloneNode(true));
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

    this._openButton?.addEventListener("click", this.#onOpenToolbarButtonClick);
    this._closeButton?.addEventListener(
      "click",
      this.#onCloseToolbarButtonClick
    );

    this.#applyDefaultStyles();
    this.#hideUi(localStorage.getItem(STORAGE_KEY_HIDE_UI) === "true");
  }

  disconnectedCallback() {
    this._openButton?.removeEventListener(
      "click",
      this.#onOpenToolbarButtonClick
    );
    this._closeButton?.removeEventListener(
      "click",
      this.#onCloseToolbarButtonClick
    );
  }

  /**
   *
   * @param {string} name
   * @param {string} _oldValue
   * @param {string} _newValue
   */
  attributeChangedCallback(name, _oldValue, _newValue) {
    if (name === ATTR_HIDDEN) {
      this.#hideUi(this.hasAttribute(ATTR_HIDDEN));
    }
  }

  /** @param {boolean} hide */
  set hidden(hide) {
    if (Boolean(hide)) {
      this.setAttribute(ATTR_HIDDEN, "");
    } else {
      this.removeAttribute(ATTR_HIDDEN);
    }

    this.#hideUi(Boolean(hide));
  }

  /** @returns {boolean} */
  get hidden() {
    return this.hasAttribute(ATTR_HIDDEN);
  }

  /** @param {boolean} hide */
  #hideUi(hide) {
    const ui = this.shadowRoot?.querySelector(".ui");

    ui?.classList.toggle("hidden", hide);
    localStorage.setItem(STORAGE_KEY_HIDE_UI, hide.toString());
  }

  #applyDefaultStyles() {
    const defaultStyles = document.getElementById(DEFAULT_STYLES_ID);

    if (!defaultStyles) {
      const styleElement = document.createElement("style");
      styleElement.setAttribute("id", DEFAULT_STYLES_ID);
      styleElement.innerHTML = getDefaultStylesCSS();
      document.head.appendChild(styleElement);
    }
  }

  /** @param {MouseEvent} ev */
  #onOpenToolbarButtonClick = (ev) => {
    ev.stopPropagation();
    this._panel?.classList.add("open");
    this._openButton?.classList.add("open");
    window.addEventListener("click", this.#onWindowClick);
  };

  #onCloseToolbarButtonClick = () => {
    this._panel?.classList.remove("open");
    this._openButton?.classList.remove("open");
    window.removeEventListener("click", this.#onWindowClick);
  };

  /** @param {MouseEvent} ev */
  #onWindowClick = (ev) => {
    if (ev.target) {
      const path = ev.composedPath();
      const panelClicked = path.find((e) => e === this._panel);

      if (!panelClicked) {
        this._panel?.classList.remove("open");
        this._openButton?.classList.remove("open");
        window.removeEventListener("click", this.#onWindowClick);
      }
    }
  };
}
