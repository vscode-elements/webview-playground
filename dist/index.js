// @ts-check

import { VscodeDemo } from "./demo.js";
import { VscodeDevToolbar } from "./dev-toolbar.js";
import { VscodeThemeSelector } from "./theme-selector.js";
import { VscodeToggleMotion } from "./toggle-motion.js";
import { VscodeToggleUnderline } from "./toggle-underline.js";
import { VscodeViewContainerSelector } from "./view-container-selector.js";

customElements.define("vscode-demo", VscodeDemo);
customElements.define("vscode-dev-toolbar", VscodeDevToolbar);
customElements.define("vscode-theme-selector", VscodeThemeSelector);
customElements.define("vscode-toggle-motion", VscodeToggleMotion);
customElements.define("vscode-toggle-underline", VscodeToggleUnderline);
customElements.define(
  "vscode-view-container-selector",
  VscodeViewContainerSelector
);
