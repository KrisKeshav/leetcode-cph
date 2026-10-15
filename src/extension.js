const vscode = require('vscode');
const { getSlugFromUrl, fetchProblem } = require('./leetcode');
const { getTestDir, saveTestCases } = require('./testcases');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('leetcodeCph.fetchTestCases', fetchTestCases),
    vscode.commands.registerCommand('leetcodeCph.runTestCases', runTestCases)
  );
}

// Test cases are tied to the file that is open in the editor.
function getSolutionDocument() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.isUntitled) {
    vscode.window.showErrorMessage('Open your saved solution file (.cpp or .py) first.');
    return null;
  }
  return editor.document;
}

async function fetchTestCases() {
  const document = getSolutionDocument();
  if (!document) return;

  const url = await vscode.window.showInputBox({
    prompt: 'Paste the LeetCode problem URL',
    placeHolder: 'https://leetcode.com/problems/two-sum/'
  });
  if (!url) return;

  const slug = getSlugFromUrl(url);
  if (!slug) {
    vscode.window.showErrorMessage('That does not look like a LeetCode problem URL.');
    return;
  }

  try {
    const problem = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: `Fetching "${slug}" from LeetCode...` },
      () => fetchProblem(slug)
    );

    if (problem.testCases.length === 0) {
      vscode.window.showWarningMessage(`No sample test cases found for "${problem.title}".`);
      return;
    }

    saveTestCases(getTestDir(document.fileName), problem.testCases);
    vscode.window.showInformationMessage(
      `Saved ${problem.testCases.length} test cases for "${problem.title}".`
    );
  } catch (err) {
    vscode.window.showErrorMessage(`Could not fetch test cases: ${err.message}`);
  }
}

async function runTestCases() {
  vscode.window.showInformationMessage('Run Test Cases: not implemented yet');
}

function deactivate() {}

module.exports = { activate, deactivate };
