// Stores test cases as plain text files next to the solution:
//   two_sum.cpp
//   .cph/two_sum/input_1.txt, output_1.txt, input_2.txt, ...
// Plain files make it easy to edit a case or add my own by hand.

const fs = require('fs');
const path = require('path');

function getTestDir(solutionPath) {
  const { dir, name } = path.parse(solutionPath);
  return path.join(dir, '.cph', name);
}

function saveTestCases(testDir, testCases) {
  fs.rmSync(testDir, { recursive: true, force: true });
  fs.mkdirSync(testDir, { recursive: true });

  testCases.forEach((testCase, i) => {
    fs.writeFileSync(path.join(testDir, `input_${i + 1}.txt`), testCase.input + '\n');
    fs.writeFileSync(path.join(testDir, `output_${i + 1}.txt`), testCase.output + '\n');
  });
}

function loadTestCases(testDir) {
  if (!fs.existsSync(testDir)) {
    return [];
  }

  const numbers = fs.readdirSync(testDir)
    .map(file => file.match(/^input_(\d+)\.txt$/))
    .filter(Boolean)
    .map(match => Number(match[1]))
    .sort((a, b) => a - b);

  return numbers.map(n => {
    const outputFile = path.join(testDir, `output_${n}.txt`);
    return {
      id: n,
      input: fs.readFileSync(path.join(testDir, `input_${n}.txt`), 'utf8'),
      output: fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : ''
    };
  });
}

module.exports = { getTestDir, saveTestCases, loadTestCases };
