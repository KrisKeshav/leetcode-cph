const vscode = require('vscode');
const path = require('path');
const { getSlugFromUrl, fetchProblem } = require('./leetcode');
const { getTestDir, saveTestCases, loadTestCases } = require('./testcases');
const { getLanguage, runSolution } = require('./runner');
const { getVerdict } = require('./compare');
const { showResults, showCompileError } = require('./resultsView');

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
  const document = getSolutionDocument();
  if (!document) return;

  const filePath = document.fileName;
  if (!getLanguage(filePath)) {
    vscode.window.showErrorMessage('Only C++ (.cpp) and Python (.py) files are supported.');
    return;
  }

  const testDir = getTestDir(filePath);
  const testCases = loadTestCases(testDir);
  if (testCases.length === 0) {
    vscode.window.showErrorMessage('No test cases found. Run "CPH: Fetch Test Cases from LeetCode" first.');
    return;
  }

  await document.save();

  const config = vscode.workspace.getConfiguration('leetcodeCph');
  const settings = {
    cppCompileCommand: config.get('cppCompileCommand'),
    pythonCommand: config.get('pythonCommand'),
    timeLimitMs: config.get('timeLimitMs')
  };

  const { compileError, results } = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Running test cases...' },
    () => runSolution(filePath, testDir, testCases, settings)
  );

  const title = path.basename(filePath);
  if (compileError) {
    showCompileError(title, compileError);
    return;
  }

  results.forEach(result => (result.verdict = getVerdict(result)));
  showResults(title, results);

  const failed = results.filter(r => r.verdict !== 'Passed').length;
  vscode.window.setStatusBarMessage(
    failed === 0 ? `$(check) All ${results.length} tests passed` : `$(x) ${failed} test(s) failed`,
    5000
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
