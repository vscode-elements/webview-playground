import { chromium } from "playwright";
import fs from "node:fs/promises";

const wait = (t) => new Promise((resolve, _reject) => setTimeout(resolve, t));

const divider = () => {
  console.log("".padEnd(80, " "));
};

async function getThemeDefinitionContent(page) {
  await page.getByRole("menuitem", { name: "Application Menu" }).click();
  await page.getByLabel("Help").dispatchEvent("mouseover");
  await page.getByLabel("Welcome", { exact: true }).first().click();
  await page.locator(".getting-started-category.featured").click();
  const webviewIframe = page.locator("iframe.webview.ready");
  await webviewIframe.waitFor({ state: "attached" });

  const activeFrame = webviewIframe.contentFrame().locator("#active-frame");
  const activeFrameDOM = activeFrame.contentFrame();

  const res = await activeFrameDOM.locator("html").evaluate((html) => {
    const mapper = (s) => {
      const k = s.replace(/\./g, "\\.");
      const v = document.documentElement.style
        .getPropertyValue(s)
        .replaceAll('"', '\\"');
      return `  ["${k}", "${v}"],\n`;
    };

    const variables = Array.from(html.style)
      .sort((a, b) => a.localeCompare(b))
      .filter(
        (s) =>
          s.startsWith("--vscode") &&
          s.indexOf("--vscode-font-family") === -1 &&
          s.indexOf("--vscode-editor-font-family") === -1
      )
      .map(mapper)
      .join("");

    let js = "/** @type {[string, string][]} */\n";
    js += `export const theme = [\n${variables}];\n`;
    return js;
  });

  return res;
}

async function changeTheme(page, theme) {
  console.log("Select theme:", theme);
  await page.goto("https://vscode.dev");
  await page.locator(".action-item.command-center-center").focus();
  await page.keyboard.press("Control+Shift+P");
  await page.keyboard.type("Preferences: Color Theme", { delay: 100 });
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.type(theme, { delay: 100 });
  await page.keyboard.press("Enter");
  await wait(1000);

  console.log(theme, "applied");
}

async function saveTheme(page, theme, path) {
  await changeTheme(page, theme);
  const data = await getThemeDefinitionContent(page);
  await fs.writeFile(path, data);
  console.log(path, "saved");
  divider();
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  divider();
  await saveTheme(page, "Light+", "dist/themes/light.js");
  await saveTheme(page, "Light Modern", "dist/themes/light-v2.js");
  await saveTheme(page, "Solarized Light", "dist/themes/light-solarized.js");
  await saveTheme(page, "Quiet Light", "dist/themes/light-quiet.js");
  await saveTheme(page, "Dark+", "dist/themes/dark.js");
  await saveTheme(page, "Dark Modern", "dist/themes/dark-v2.js");
  await saveTheme(page, "Monokai", "dist/themes/dark-monokai.js");
  await saveTheme(page, "Solarized Dark", "dist/themes/dark-solarized.js");
  await saveTheme(page, "Dark High Contrast", "dist/themes/hc-dark.js");
  await saveTheme(page, "Light High Contrast", "dist/themes/hc-light.js");
  browser.close();
  console.log("Done");
  divider();
}

main();
