// @ts-check

import { VscodeDemo } from "./demo.js";
import { DEMO_TAG_NAME, TOOLBAR_TAG_NAME } from "./shared.js";
import { VscodeDevToolbar } from "./toolbar.js";

customElements.define(TOOLBAR_TAG_NAME, VscodeDevToolbar);
customElements.define(DEMO_TAG_NAME, VscodeDemo);
