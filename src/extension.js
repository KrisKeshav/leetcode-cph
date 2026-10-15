const vscode = require('vscode');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('leetcodeCph.fetchTestCases', fetchTestCases),
    vscode.commands.registerCommand('leetcodeCph.runTestCases', runTestCases)
  );
}

async function fetchTestCases() {
  vscode.window.showInformationMessage('Fetch Test Cases: not implemented yet');
}

async function runTestCases() {
  vscode.window.showInformationMessage('Run Test Cases: not implemented yet');
}

function deactivate() {}

module.exports = { activate, deactivate };
