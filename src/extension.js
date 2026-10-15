const vscode = require('vscode');
const { getSlugFromUrl, fetchProblem } = require('./leetcode');
const { getTestDir, saveTestCases, loadTestCases } = require('./testcases');
const { getLanguage, runSolution } = require('./runner');

let output;

function activate(context) {
  output = vscode.window.createOutputChannel('LeetCode CPH');
  context.subscriptions.push(
    output,
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

  output.clear();
  output.show(true);
  if (compileError) {
    output.appendLine('Compilation Error:');
    output.appendLine(compileError);
    return;
  }
  for (const result of results) {
    output.appendLine(`Test ${result.id} (${result.timeMs} ms)`);
    output.appendLine(`Input:\n${result.input}`);
    output.appendLine(`Expected:\n${result.output}`);
    output.appendLine(`Received:\n${result.stdout}${result.stderr}`);
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
