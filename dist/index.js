// @ts-check

import { VscodeDemo } from "./demo.js";
import { VscodeDevToolbar } from "./toolbar.js";
import { VscodeThemeSelector } from "./theme-selector.js";
import { VscodeViewContainerSelector } from "./view-container-selector.js";
import { VscodeToggleUnderline } from "./toggle-underline.js";
import { VscodeToggleMotion } from "./toggle-motion.js";

customElements.define("vscode-dev-toolbar", VscodeDevToolbar);
customElements.define("vscode-demo", VscodeDemo);
customElements.define("vscode-theme-selector", VscodeThemeSelector);
customElements.define(
  "vscode-view-container-selector",
  VscodeViewContainerSelector
);
customElements.define("vscode-toggle-underline", VscodeToggleUnderline);
customElements.define("vscode-toggle-motion", VscodeToggleMotion);
