const test = require('node:test');
const assert = require('node:assert');
const { getSlugFromUrl, parseOutputs } = require('../src/leetcode');

test('extracts slug from different LeetCode URL formats', () => {
  assert.strictEqual(getSlugFromUrl('https://leetcode.com/problems/two-sum/'), 'two-sum');
  assert.strictEqual(getSlugFromUrl('https://leetcode.com/problems/two-sum/description/'), 'two-sum');
  assert.strictEqual(getSlugFromUrl('leetcode.com/problems/Valid-Parentheses'), 'valid-parentheses');
  assert.strictEqual(getSlugFromUrl('https://codeforces.com/problemset/problem/1/A'), null);
});

test('parses outputs from old <pre> style examples', () => {
  const html = `
    <pre>
    <strong>Input:</strong> nums = [2,7,11,15], target = 9
    <strong>Output:</strong> [0,1]
    <strong>Explanation:</strong> Because nums[0] + nums[1] == 9.
    </pre>
    <pre>
    <strong>Input:</strong> s = &quot;()&quot;
    <strong>Output:</strong> true
    </pre>`;
  assert.deepStrictEqual(parseOutputs(html), ['[0,1]', 'true']);
});

test('parses outputs from new example-block style examples', () => {
  const html = `
    <div class="example-block">
    <p><strong>Input:</strong> <span class="example-io">word = &quot;abbcccc&quot;</span></p>
    <p><strong>Output:</strong> <span class="example-io">5</span></p>
    </div>`;
  assert.deepStrictEqual(parseOutputs(html), ['5']);
});
