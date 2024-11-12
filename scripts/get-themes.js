import { chromium } from "playwright";
import fs from "node:fs/promises";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://vscode.dev");

  await page.getByLabel("Application Menu").click();
  await page.getByLabel("Help").dispatchEvent("mouseover");
  await page.getByLabel("Welcome", { exact: true }).first().click();
  await page.locator(".getting-started-category.featured").click();
  const webviewIframe = page.locator("iframe.webview.ready");
  await webviewIframe.waitFor({ state: "attached" });

  // const webview = page.locator("iframe.webview.ready");
  const activeFrame = webviewIframe.contentFrame().locator("#active-frame");
  const activeFrameDOM = activeFrame.contentFrame();

  console.log(activeFrame.contentFrame());

  const res = await activeFrameDOM.locator("html").evaluate((html) => {
    return Array.from(html.style).filter((s) => s.startsWith('--vscode'));
  });

  // const res = await webview.contentFrame().evaluate(() => {
  //   // const activeFrame = document.querySelector('#active-frame').contentDocument;

  //   const mapper = (s) => {
  //     const k = s.replace(/\./g, "\\.");
  //     const v = document.documentElement.style.getPropertyValue(s);
  //     const p = `${s.replace(
  //       /\./g,
  //       "\\."
  //     )}: ${document.documentElement.style.getPropertyValue(s)}`;
  //     return `  ["${k}", "${v}"],\n`;
  //   };

  //   const list = Array.from(document.documentElement.style)
  //     .sort((a, b) => a.localeCompare(b))
  //     .filter(
  //       (v) =>
  //         v.indexOf("--vscode-font-family") === -1 &&
  //         v.indexOf("--vscode-editor-font-family") === -1 &&
  //         v.indexOf("--text-link-decoration") === -1
  //     )
  //     .map(mapper)
  //     .join("");
  //   let js = "/** @type {[string, string][]} */\n";
  //   js += `export const theme = [\n${list}];\n`;

  //   return document.documentElement.outerHTML;
  // });

  // console.log(res);

  // await page.screenshot({ path: "screenshot.png" });

  console.log(res);

  await fs.writeFile('result.txt', res.toString());
}

main();
