# LeetCode CPH

A small VS Code extension I made for my own LeetCode practice. It fetches the sample test cases from a LeetCode problem URL, saves them as files, runs my C++ or Python solution on them, and shows which cases fail.

## Why I built this

I like solving problems in VS Code, not in the LeetCode browser editor. I get my own snippets, my own debugger, and I keep all my solutions in one folder. For Codeforces I already use [CPH](https://github.com/agrawal-d/cph). For LeetCode, though, every problem meant copying each sample input into a file, running the code, and checking the output by eye. With 3–5 examples per problem, that adds up.

So now I paste the problem URL once and press `Ctrl+Alt+B` to run every sample.

## Features

- **Fetch test cases from a URL**: paste a link like `https://leetcode.com/problems/two-sum/`, and the extension gets the sample inputs and expected outputs from LeetCode's GraphQL API.
- **Test cases stored as files**: saved as `input_N.txt` / `output_N.txt` in a `.cph/` folder next to the solution, so I can edit them or add my own edge cases by hand.
- **Runs C++ and Python**: compiles C++ with `g++` and runs Python with `python`. Each input is passed through stdin, with a time limit.
- **Output comparison**: shows Passed / Wrong Answer / Runtime Error / Time Limit Exceeded per test, with expected and received output side by side and the mismatched lines highlighted.

## Usage

1. Open (and save) your solution file, e.g. `two_sum.cpp` or `two_sum.py`.
2. Run **CPH: Fetch Test Cases from LeetCode** (`Ctrl+Alt+L`) and paste the problem URL.
3. Run **CPH: Run Test Cases** (`Ctrl+Alt+B`) or click the ▶ button in the editor title bar.

LeetCode problems are function-based, so the solution file needs a small `main` that reads the input from stdin. The input file has **one parameter per line**, the same format LeetCode uses in its "Testcase" tab:

```
[2,7,11,15]
9
```

The program should print the answer in LeetCode's format (e.g. `[0,1]`, `true`). See [examples/](examples/) for a C++ and a Python solution set up this way.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `leetcodeCph.cppCompileCommand` | `g++ -std=c++17 -O2` | Compile command for C++ |
| `leetcodeCph.pythonCommand` | `python` | Command used to run Python |
| `leetcodeCph.timeLimitMs` | `3000` | Time limit per test case |

## How it works

```
src/
├── extension.js    # registers the two commands, wires everything together
├── leetcode.js     # problem URL -> slug -> GraphQL request -> {input, output} pairs
├── testcases.js    # saves / loads input_N.txt and output_N.txt files
├── runner.js       # compiles C++, runs the program with each input on stdin
├── compare.js      # normalizes output and decides the verdict
└── resultsView.js  # webview panel that shows the results
```

- **Fetching:** LeetCode's GraphQL endpoint (`https://leetcode.com/graphql`) returns `exampleTestcaseList`, which holds the sample inputs. It does not return the expected outputs separately, so `leetcode.js` reads them from the `Output:` lines in the problem description HTML.
- **Running:** C++ is compiled once into `.cph/<name>/`, then each test case is run with `child_process.spawn`. The input is written to stdin and stdout/stderr are captured. A timer kills the process if it goes over the time limit.
- **Comparing:** both outputs are normalized first (Windows `\r\n`, trailing spaces, trailing blank lines) so that formatting noise doesn't count as a wrong answer. They are then compared line by line to find which lines to highlight.

## Running locally

```bash
git clone https://github.com/KrisKeshav/leetcode-cph.git
cd leetcode-cph
code .
```

Press `F5` to open a new VS Code window with the extension loaded. There are no npm dependencies; unit tests use Node's built-in test runner:

```bash
npm test
```

## Limitations

- Only the sample test cases from the description are fetched, not LeetCode's hidden tests.
- Premium problems can't be fetched without logging in.
- Problems that accept any valid answer order (e.g. "return in any order") are compared as exact text, so a correct answer in a different order shows as a mismatch.
