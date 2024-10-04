// @ts-check

/**
 * @typedef {"editor" | "sidebar" | "panel"} ViewContainer
 */

const html = String.raw;

const STORAGE_KEY_VIEW_CONTAINER = "vscode-playground:view-container";

function getComponentTemplate() {
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
    <label for="container-selector">View container</label>
    <select id="container-selector">
      <option value="editor">Editor</option>
      <option value="sidebar">Sidebar</option>
      <option value="panel">Panel</option>
    </select>
  `;
}

export class VscodeViewContainerSelector extends HTMLElement {
  /** @type {HTMLTemplateElement} */
  static template;

  /** @type {Set<VscodeViewContainerSelector>} */
  static instances = new Set();

  /** @type {ViewContainer} */
  static appliedViewContainer;

  #select;

  constructor() {
    super();

    if (!VscodeViewContainerSelector.template) {
      VscodeViewContainerSelector.template = document.createElement("template");
      VscodeViewContainerSelector.template.innerHTML = getComponentTemplate();
    }

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(
      VscodeViewContainerSelector.template.content.cloneNode(true)
    );

    this.#select = /** @type {HTMLSelectElement} */ (
      this.shadowRoot?.querySelector("#container-selector")
    );
  }

  /** @param {ViewContainer} viewContainer */
  setSelectedOption(viewContainer) {
    this.#select.value = viewContainer;
  }

  connectedCallback() {
    this.#select.addEventListener("change", this.#handleSelectorChange);
    VscodeViewContainerSelector.instances.add(this);

    const viewContainer = /** @type {ViewContainer} */ (
      localStorage.getItem(STORAGE_KEY_VIEW_CONTAINER) ?? "editor"
    );

    if (VscodeViewContainerSelector.appliedViewContainer !== viewContainer) {
      this.#setViewContainer(viewContainer);
    }

    this.#select.value = viewContainer;
  }

  disconnectedCallback() {
    this.#select.removeEventListener("change", this.#handleSelectorChange);
    VscodeViewContainerSelector.instances.delete(this);
  }

  #handleSelectorChange = () => {
    const viewContainer = /** @type {ViewContainer} */ (this.#select.value);

    if (viewContainer) {
      this.#setViewContainer(viewContainer);
      this.#syncInstances(viewContainer);
      localStorage.setItem(STORAGE_KEY_VIEW_CONTAINER, viewContainer);
    }
  };

  /** @param {ViewContainer} viewContainer */
  #setViewContainer(viewContainer) {
    let cssProperty;

    switch (viewContainer) {
      case "sidebar":
        cssProperty = "var(--vscode-sideBar-background)";
        break;
      case "panel":
        cssProperty = "var(--vscode-panel-background)";
        break;
      case "editor":
      default:
        cssProperty = "var(--vscode-editor-background)";
    }

    document.body.style.setProperty(
      "--playground-body-background",
      cssProperty
    );

    VscodeViewContainerSelector.appliedViewContainer = viewContainer;
  }

  /** @param {ViewContainer} viewContainer */
  #syncInstances(viewContainer) {
    VscodeViewContainerSelector.instances.forEach((selector) => {
      if (selector !== this) {
        selector.setSelectedOption(viewContainer);
      }
    });
  }
}
