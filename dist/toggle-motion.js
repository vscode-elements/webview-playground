// @ts-check

const html = String.raw;
const css = String.raw;

export const STORAGE_KEY_MOTION = "vscode-playground:reduce-motion";

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
    <input type="checkbox" id="toggle-motion" part="checkbox" />
    <label for="toggle-motion" part="label">Workbench: Reduce Motion</label>
  `;
}

export class VscodeToggleMotion extends HTMLElement {
  /** @type {HTMLTemplateElement} */
  static template;

  /** @type {Set<VscodeToggleMotion>} */
  static instances = new Set();

  /** @type {HTMLInputElement} */
  #checkbox;

  constructor() {
    super();

    if (!VscodeToggleMotion.template) {
      VscodeToggleMotion.template = document.createElement("template");
      VscodeToggleMotion.template.innerHTML = getComponentTemplate();
    }

    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.adoptedStyleSheets.push(styles);
    shadowRoot.appendChild(VscodeToggleMotion.template.content.cloneNode(true));

    this.#checkbox = /** @type {HTMLInputElement} */ (
      this.shadowRoot?.querySelector("#toggle-motion")
    );
  }

  connectedCallback() {
    const force = localStorage.getItem(STORAGE_KEY_MOTION) === "true";
    this.#checkbox.addEventListener("change", this.#handleCheckboxChange);
    this.#checkbox.checked = force;
    this.#toggleState(force);
    VscodeToggleMotion.instances.add(this);
  }

  disconnectedCallback() {
    this.#checkbox.removeEventListener("change", this.#handleCheckboxChange);
    VscodeToggleMotion.instances.delete(this);
  }

  /** @param {boolean} checked */
  setChecked(checked) {
    this.#checkbox.checked = checked;
  }

  /** @param {boolean} force */
  #toggleState(force) {
    document.body.classList.toggle("vscode-reduce-motion", force);
  }

  #handleCheckboxChange = () => {
    const force = this.#checkbox?.checked ?? false;
    this.#toggleState(force);
    localStorage.setItem(STORAGE_KEY_MOTION, force.toString());
    VscodeToggleMotion.instances.forEach((el) => {
      el.setChecked(force);
    });
  };
}
