/* eslint-env mocha */
const fs = require('fs');
const { spawn } = require('child_process');
const assert = require('assert');

// Set up variables for testing.
const workDir = process.cwd();
const nodeEntry = `${workDir}/index.js`;
const temporaryFile = 'test/tempFile.txt';
const testString = 'First line^^^^hip\nSecond line>>>>hip\nthird~~~hurray!\nLine number four.';

const runREPL = (child, commands) => new Promise((resolve) => {
  // Set up output and errors from stdin and stdout.
  const output = [];
  const err = [];
  child.stdout.on('data', (data) => output.push(data.toString()));
  child.stderr.on('data', (data) => err.push(data.toString()));

  // Run input commands and end.
  child.stdin.setEncoding('utf-8');
  commands.forEach(c => child.stdin.write(`${c}\n`));
  child.stdin.end();

  // Exit.
  child.on('exit', (code) => resolve({ code, err, output }));
});

before(() => {
  try {
    fs.writeFileSync(temporaryFile, testString);
  } catch (error) {
    throw new Error(`Unable to write temporary file ${temporaryFile} for tests.`);
  }
});

after(() => {
  try {
    fs.unlinkSync(temporaryFile);
  } catch (error) {
    throw new Error(`Unable to delete file ${temporaryFile} after tests.`);
  }
});

describe('running commands inside REPL', () => {
  it('executes non-ShellJS commands', async () => {
    const inputCommands = [
      'function add(a, b) {',
      'return a + b;',
      '}',
      'add(2179242.724, 3198234.878)'
    ];

    const nShell = spawn('node', [nodeEntry]);
    const { output, code } = await runREPL(nShell, inputCommands);
    assert.equal(code, 0);
    assert.equal(output.join().includes('5377477.602'), true);
  });

  it('executes ShellJS commands', async () => {
    const inputCommands = [
      'pwd()',
      `cat('${temporaryFile}')`
    ];

    const nShell = spawn('node', [nodeEntry]);
    const { code, output } = await runREPL(nShell, inputCommands);
    const result = output.join();
    assert.equal(code, 0);
    assert.equal(result.includes(workDir), true);
    assert.equal(result.includes(testString), true);
  });

  it('lets the user pick a prompt to run in the REPL', async () => {
    const myPrompt = 'a-w-e-s-o-m-e-s-h-e-l-l-->';
    const nShell = spawn('node', [nodeEntry, `--prompt=${myPrompt}`]);
    const { code, output } = await runREPL(nShell, ['\n']);
    const result = output.join();
    assert.equal(code, 0);
    assert.equal(result.includes(myPrompt), true);
  });
});

describe('running REPL commands in strict mode', () => {
  const inputCommands = ['var undefined = 3;'];
  const strictModeErrMsg = 'Cannot assign to read only property \'undefined\'';

  it('does not enforce strict mode by default', async () => {
    const nShell = spawn('node', [nodeEntry]);
    const { code, output } = await runREPL(nShell, inputCommands);
    const result = output.join();
    assert.equal(code, 0);
    assert.equal(result.includes(strictModeErrMsg), false);
  });

  it('allows strict mode as an option', async () => {
    const nShell = spawn('node', [nodeEntry, '--use_strict']);
    const { code, output } = await runREPL(nShell, inputCommands);
    const result = output.join();
    assert.equal(code, 0);
    assert.equal(result.includes(strictModeErrMsg), true);
  });
});

describe('respecting namespaces', () => {
  it('says global commands are undefined in local namespace', async () => {
    const nShell = spawn('node', [nodeEntry, '--no_global']);
    const { code, output } = await runREPL(nShell, ['ls()', 'pwd()']);
    assert.equal(code, 0);
    const result = output.join();
    assert.equal(result.includes('ls is not defined'), true);
    assert.equal(result.includes('pwd is not defined'), true);
  });

  it('runs a command in local shell namespace', async () => {
    const inputCommands = [`shell.grep('hurray', '${temporaryFile}')`];
    const nShell = spawn('node', [nodeEntry, '--no_global']);
    const { code, output } = await runREPL(nShell, inputCommands);
    assert.equal(code, 0);
    const result = output.join();
    assert.equal(result.includes('third~~~hurray'), true);
  });

  it('runs a command in local user-defined namespace', async () => {
    const inputCommands = [`$.grep('hurray', '${temporaryFile}')`];
    const nShell = spawn('node', [nodeEntry, '--no_global=$']);
    const { code, output } = await runREPL(nShell, inputCommands);
    assert.equal(code, 0);
    const result = output.join();
    assert.equal(result.includes('third~~~hurray'), true);
  });

  it.skip('does not allow overwriting namespace', async () => {
    const inputCommands = [
      'shell = "fish"',
      `shell.grep('hurray', '${temporaryFile}')`
    ];

    const nShell = spawn('node', [nodeEntry, '--no_global']);
    const { code, output } = await runREPL(nShell, inputCommands);
    assert.equal(code, 0);
    const result = output.join();
    assert.equal(result.includes('third~~~hurray'), true);
  });
});
