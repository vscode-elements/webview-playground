// @ts-check

import { VscodeDemo } from "./demo.js";
import { VscodeDevToolbar } from "./toolbar.js";
import { VscodeThemeSelector } from "./theme-selector.js";
import { VscodeViewContainerSelector } from "./view-container-selector.js";

customElements.define("vscode-dev-toolbar", VscodeDevToolbar);
customElements.define("vscode-demo", VscodeDemo);
customElements.define("vscode-theme-selector", VscodeThemeSelector);
customElements.define(
  "vscode-view-container-selector",
  VscodeViewContainerSelector
);
