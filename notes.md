To list all webview theme variables:

1. Execute VSCode without extensions: `code --disable-extensions`
2. Open the command palette, choose this command: `Developer: Open Webview Developer Tools`
3. Inspect any tag in the webview's html
4. Run the following snippet in the dev console

```javascript
(function () {
  const mapper = (s) => {
    const k = s.replace(/\./g,"\\.");
    const v = document.documentElement.style.getPropertyValue(s);
    const p = `${s.replace(/\./g,"\\.")}: ${document.documentElement.style.getPropertyValue(s)}`;
    return `  ["${k}", "${v}"],\n`;
  }
  const list = Array.from(document.documentElement.style)
    .sort((a, b) => a.localeCompare(b))
    .filter(
      (v) =>
        v.indexOf("--vscode-font-family") === -1 &&
        v.indexOf("--text-link-decoration") === -1
    )
    .map(mapper)
    .join("");
  const res = `export const theme = [\n${list}];\n`

  console.log(res);
})();
```
