// @ts-check

const html = String.raw;
const css = String.raw;

export const STORAGE_KEY_UNDERLINE = "vscode-playground:underline";

const styles = new CSSStyleSheet();
styles.replaceSync(css`
  :host {
    align-items: flex-start;
    display: flex;
    font-size: 13px;
    white-space: nowrap;
  }

  input {
    display: block;
    margin: 3px 4px 0 0;
  }

  label {
    user-select: none;
  }
`);

function getComponentTemplate() {
  return html`
    <input type="checkbox" id="toggle-underline" part="checkbox">
    <label for="toggle-underline" part="label"
      >Accessibility: Underline Links</span></label
    >
  `;
}

export class VscodeToggleUnderline extends HTMLElement {
  /** @type {HTMLTemplateElement} */
  static template;

  /** @type {Set<VscodeToggleUnderline>} */
  static instances = new Set();

  /** @type {HTMLInputElement} */
  #checkbox;

  constructor() {
    super();

    if (!VscodeToggleUnderline.template) {
      VscodeToggleUnderline.template = document.createElement("template");
      VscodeToggleUnderline.template.innerHTML = getComponentTemplate();
    }

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.adoptedStyleSheets.push(styles);
    shadowRoot.appendChild(
      VscodeToggleUnderline.template.content.cloneNode(true)
    );

    this.#checkbox = /** @type {HTMLInputElement} */ (
      this.shadowRoot?.querySelector("#toggle-underline")
    );
  }

  connectedCallback() {
    const underline = localStorage.getItem(STORAGE_KEY_UNDERLINE) === "true";
    this.#checkbox.addEventListener("change", this.#handleCheckboxChange);
    this.#checkbox.checked = underline;
    this.#toggleState(underline);
    VscodeToggleUnderline.instances.add(this);
  }

  disconnectedCallback() {
    this.#checkbox.removeEventListener("change", this.#handleCheckboxChange);
    VscodeToggleUnderline.instances.delete(this);
  }

  /** @param {boolean} checked */
  setChecked(checked) {
    this.#checkbox.checked = checked;
  }

  /** @param {boolean} force */
  #toggleState(force) {
    const decoration = force ? "underline" : "none";

    if (
      document.documentElement.style.getPropertyValue(
        "--text-link-decoration"
      ) !== decoration
    ) {
      document.documentElement.style.setProperty(
        "--text-link-decoration",
        decoration
      );
    }
  }

  #handleCheckboxChange = () => {
    const underline = this.#checkbox?.checked ?? false;
    this.#toggleState(underline);
    localStorage.setItem(STORAGE_KEY_UNDERLINE, underline.toString());

    VscodeToggleUnderline.instances.forEach((el) => {
      if (el !== this) {
        el.setChecked(underline);
      }
    });
  };
}
