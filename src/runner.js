// Compiles (for C++) and runs a solution against each test case, feeding
// the input file through stdin and capturing stdout.

const { spawn, exec } = require('child_process');
const path = require('path');

function getLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.cpp', '.cc', '.cxx'].includes(ext)) return 'cpp';
  if (ext === '.py') return 'python';
  return null;
}

function compileCpp(filePath, exePath, compileCommand) {
  return new Promise(resolve => {
    exec(`${compileCommand} "${filePath}" -o "${exePath}"`, (err, stdout, stderr) => {
      resolve(err ? { ok: false, error: stderr || err.message } : { ok: true });
    });
  });
}

function runProcess(command, args, input, timeLimitMs) {
  return new Promise(resolve => {
    const start = Date.now();
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let finished = false;

    const finish = (exitCode, errorMessage) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: errorMessage || stderr,
        exitCode,
        timedOut,
        timeMs: Date.now() - start
      });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeLimitMs);

    child.stdout.on('data', data => (stdout += data));
    child.stderr.on('data', data => (stderr += data));
    child.on('error', err => finish(-1, err.message));
    child.on('close', code => finish(code));

    // The program may exit without reading all of its input.
    child.stdin.on('error', () => {});
    child.stdin.write(input);
    child.stdin.end();
  });
}

// settings: { cppCompileCommand, pythonCommand, timeLimitMs }
async function runSolution(filePath, testDir, testCases, settings) {
  const language = getLanguage(filePath);
  let command;
  let args;

  if (language === 'cpp') {
    const exeName = path.parse(filePath).name + (process.platform === 'win32' ? '.exe' : '');
    const exePath = path.join(testDir, exeName);
    const compiled = await compileCpp(filePath, exePath, settings.cppCompileCommand);
    if (!compiled.ok) {
      return { compileError: compiled.error, results: [] };
    }
    command = exePath;
    args = [];
  } else if (language === 'python') {
    command = settings.pythonCommand;
    args = [filePath];
  } else {
    throw new Error('Only C++ (.cpp) and Python (.py) files are supported.');
  }

  const results = [];
  for (const testCase of testCases) {
    const run = await runProcess(command, args, testCase.input, settings.timeLimitMs);
    results.push({ ...testCase, ...run });
  }
  return { results };
}

module.exports = { getLanguage, runProcess, runSolution };
