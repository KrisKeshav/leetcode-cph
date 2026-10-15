// Shows test results in a webview panel beside the editor.

const vscode = require('vscode');
const { diffLines } = require('./compare');

let panel;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderLines(lines, key) {
  return lines
    .map(line => `<div class="${line.match ? '' : 'mismatch'}">${escapeHtml(line[key]) || '&nbsp;'}</div>`)
    .join('');
}

function renderResult(result) {
  const passed = result.verdict === 'Passed';
  const lines = diffLines(result.output, result.stdout);
  const stderr = result.stderr ? `<h4>Error</h4><pre class="error">${escapeHtml(result.stderr)}</pre>` : '';

  return `
    <div class="test ${passed ? 'pass' : 'fail'}">
      <div class="header">
        <span>Test ${result.id}</span>
        <span>${result.verdict} &middot; ${result.timeMs} ms</span>
      </div>
      <h4>Input</h4>
      <pre>${escapeHtml(result.input)}</pre>
      <div class="columns">
        <div><h4>Expected</h4><pre>${renderLines(lines, 'expected')}</pre></div>
        <div><h4>Received</h4><pre>${renderLines(lines, 'actual')}</pre></div>
      </div>
      ${stderr}
    </div>`;
}

function getHtml(title, body) {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 8px 16px; }
  .summary { font-size: 1.1em; margin-bottom: 12px; }
  .test { border: 1px solid var(--vscode-panel-border); border-left-width: 4px; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; }
  .test.pass { border-left-color: #2ea043; }
  .test.fail { border-left-color: #f85149; }
  .header { display: flex; justify-content: space-between; font-weight: bold; }
  .pass .header span:last-child { color: #2ea043; }
  .fail .header span:last-child { color: #f85149; }
  h4 { margin: 10px 0 4px; opacity: 0.8; }
  pre { background: var(--vscode-textCodeBlock-background); padding: 6px 8px; margin: 0; white-space: pre-wrap; word-break: break-all; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .mismatch { background: rgba(248, 81, 73, 0.25); }
  .error { color: #f85149; }
</style>
</head>
<body>
  <h2>${escapeHtml(title)}</h2>
  ${body}
</body>
</html>`;
}

function showPanel(title, body) {
  if (!panel) {
    panel = vscode.window.createWebviewPanel('leetcodeCphResults', 'CPH Results', vscode.ViewColumn.Beside, {});
    panel.onDidDispose(() => (panel = undefined));
  }
  panel.webview.html = getHtml(title, body);
  panel.reveal(vscode.ViewColumn.Beside, true);
}

function showResults(title, results) {
  const passed = results.filter(r => r.verdict === 'Passed').length;
  const summary = `<div class="summary">${passed} / ${results.length} passed</div>`;
  showPanel(title, summary + results.map(renderResult).join(''));
}

function showCompileError(title, error) {
  showPanel(title, `<h4>Compilation Error</h4><pre class="error">${escapeHtml(error)}</pre>`);
}

module.exports = { showResults, showCompileError };
