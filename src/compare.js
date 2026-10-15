// Compares expected vs actual output, ignoring the whitespace differences
// that don't matter (Windows line endings, trailing spaces, extra blank lines).

function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

function outputsMatch(expected, actual) {
  return normalize(expected) === normalize(actual);
}

// Line-by-line comparison so the results view can highlight exactly
// which lines are wrong.
function diffLines(expected, actual) {
  const expectedLines = normalize(expected).split('\n');
  const actualLines = normalize(actual).split('\n');
  const length = Math.max(expectedLines.length, actualLines.length);

  const lines = [];
  for (let i = 0; i < length; i++) {
    const exp = expectedLines[i] ?? '';
    const act = actualLines[i] ?? '';
    lines.push({ expected: exp, actual: act, match: exp === act });
  }
  return lines;
}

function getVerdict(result) {
  if (result.timedOut) return 'Time Limit Exceeded';
  if (result.exitCode !== 0) return 'Runtime Error';
  return outputsMatch(result.output, result.stdout) ? 'Passed' : 'Wrong Answer';
}

module.exports = { normalize, outputsMatch, diffLines, getVerdict };
