const css = String.raw;

export function getDefaultStylesCSS(scopePrefix = '') {
  const topLevelStyles = css`
    html {
      scrollbar-color: var(--vscode-scrollbarSlider-background)
        var(--vscode-editor-background);
    }

    body {
      overscroll-behavior-x: none;
      background-color: var(--playground-body-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-weight: var(--vscode-font-weight);
      font-size: var(--vscode-font-size);
      margin: 0;
      padding: 0 20px;
    }
  `;

  return css`
    ${scopePrefix ? '' : topLevelStyles}

    ${scopePrefix}img,
    ${scopePrefix}video {
      max-width: 100%;
      max-height: 100%;
    }

    ${scopePrefix}a,
    ${scopePrefix}a code {
      color: var(--vscode-textLink-foreground);
    }

    ${scopePrefix}p > a {
      text-decoration: var(--text-link-decoration);
    }

    ${scopePrefix}a:hover {
      color: var(--vscode-textLink-activeForeground);
    }

    ${scopePrefix}a:focus,
    input:focus,
    select:focus,
    textarea:focus {
      outline: 1px solid -webkit-focus-ring-color;
      outline-offset: -1px;
    }

    ${scopePrefix}code {
      font-family: var(--monaco-monospace-font);
      color: var(--vscode-textPreformat-foreground);
      background-color: var(--vscode-textPreformat-background);
      padding: 1px 3px;
      border-radius: 4px;
    }

    ${scopePrefix}pre code {
      padding: 0;
    }

    ${scopePrefix}blockquote {
      background: var(--vscode-textBlockQuote-background);
      border-color: var(--vscode-textBlockQuote-border);
    }

    ${scopePrefix}kbd {
      background-color: var(--vscode-keybindingLabel-background);
      color: var(--vscode-keybindingLabel-foreground);
      border-style: solid;
      border-width: 1px;
      border-radius: 3px;
      border-color: var(--vscode-keybindingLabel-border);
      border-bottom-color: var(--vscode-keybindingLabel-bottomBorder);
      box-shadow: inset 0 -1px 0 var(--vscode-widget-shadow);
      vertical-align: middle;
      padding: 1px 3px;
    }

    ${scopePrefix}::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ${scopePrefix}::-webkit-scrollbar-corner {
      background-color: var(--vscode-editor-background);
    }

    ${scopePrefix}::-webkit-scrollbar-thumb {
      background-color: var(--vscode-scrollbarSlider-background);
    }
    ${scopePrefix}::-webkit-scrollbar-thumb:hover {
      background-color: var(--vscode-scrollbarSlider-hoverBackground);
    }
    ${scopePrefix}::-webkit-scrollbar-thumb:active {
      background-color: var(--vscode-scrollbarSlider-activeBackground);
    }
    ${scopePrefix}::highlight(find-highlight) {
      background-color: var(--vscode-editor-findMatchHighlightBackground);
    }
    ${scopePrefix}::highlight(current-find-highlight) {
      background-color: var(--vscode-editor-findMatchBackground);
    }
  `;
}