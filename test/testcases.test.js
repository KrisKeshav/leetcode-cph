const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getTestDir, saveTestCases, loadTestCases } = require('../src/testcases');

test('test dir is .cph/<file name> next to the solution', () => {
  const dir = getTestDir(path.join('home', 'two_sum.cpp'));
  assert.strictEqual(dir, path.join('home', '.cph', 'two_sum'));
});

test('saved test cases can be loaded back in order', () => {
  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cph-'));
  const cases = [];
  for (let i = 1; i <= 11; i++) {
    cases.push({ input: `in ${i}`, output: `out ${i}` });
  }

  saveTestCases(testDir, cases);
  const loaded = loadTestCases(testDir);

  assert.strictEqual(loaded.length, 11);
  assert.strictEqual(loaded[1].input, 'in 2\n');
  assert.strictEqual(loaded[10].id, 11);
  assert.strictEqual(loaded[10].output, 'out 11\n');

  fs.rmSync(testDir, { recursive: true, force: true });
});

test('missing test dir gives no test cases', () => {
  assert.deepStrictEqual(loadTestCases(path.join(os.tmpdir(), 'does-not-exist-cph')), []);
});
