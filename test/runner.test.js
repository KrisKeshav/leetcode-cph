const test = require('node:test');
const assert = require('node:assert');
const { getLanguage, runProcess } = require('../src/runner');

test('detects language from file extension', () => {
  assert.strictEqual(getLanguage('a/two_sum.cpp'), 'cpp');
  assert.strictEqual(getLanguage('a/two_sum.py'), 'python');
  assert.strictEqual(getLanguage('a/two_sum.java'), null);
});

test('passes input through stdin and captures stdout', async () => {
  const echo = 'process.stdin.on("data", d => process.stdout.write(String(d).toUpperCase()))';
  const run = await runProcess(process.execPath, ['-e', echo], 'hello', 5000);
  assert.strictEqual(run.stdout, 'HELLO');
  assert.strictEqual(run.exitCode, 0);
  assert.strictEqual(run.timedOut, false);
});

test('kills the program when it exceeds the time limit', async () => {
  const run = await runProcess(process.execPath, ['-e', 'while (true) {}'], '', 300);
  assert.strictEqual(run.timedOut, true);
});
