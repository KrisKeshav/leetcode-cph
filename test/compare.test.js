const test = require('node:test');
const assert = require('node:assert');
const { outputsMatch, diffLines, getVerdict } = require('../src/compare');

test('ignores line endings, trailing spaces and trailing newlines', () => {
  assert.ok(outputsMatch('[0,1]\n', '[0,1]'));
  assert.ok(outputsMatch('1 2\n3', '1 2  \r\n3\r\n\r\n'));
  assert.ok(!outputsMatch('[0,1]', '[1,0]'));
  assert.ok(!outputsMatch('true', 'True'));
});

test('marks only the mismatched lines', () => {
  const lines = diffLines('1\n2\n3', '1\n5\n3\n4');
  assert.deepStrictEqual(lines.map(l => l.match), [true, false, true, false]);
  assert.strictEqual(lines[3].expected, '');
  assert.strictEqual(lines[3].actual, '4');
});

test('gives the right verdict', () => {
  const base = { output: '5\n', stdout: '5\n', exitCode: 0, timedOut: false };
  assert.strictEqual(getVerdict(base), 'Passed');
  assert.strictEqual(getVerdict({ ...base, stdout: '6' }), 'Wrong Answer');
  assert.strictEqual(getVerdict({ ...base, exitCode: 1 }), 'Runtime Error');
  assert.strictEqual(getVerdict({ ...base, timedOut: true }), 'Time Limit Exceeded');
});
