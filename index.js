#!/usr/bin/env node

// ShellJS plugins
require('shelljs-plugin-clear');
require('shelljs-plugin-inspect');
require('shelljs-plugin-open');
require('shelljs-plugin-sleep');

const util = require('util');
const repl = require('repl');
const argv = require('minimist')(process.argv.slice(2));
const replHistory = require('repl.history');
const osHomedir = require('os-homedir');
const path = require('path');

let shell;
let json;
let isLocal;
try {
  if (argv.path[0] === '~') argv.path = argv.path.replace('~', osHomedir());
  const localShellJS = path.resolve(argv.path);
  shell = require('require-relative')(localShellJS, process.cwd());
  json = require(path.join(localShellJS, 'package.json'));
  isLocal = true;
} catch (e) {
  shell = require('shelljs');
  json = require('shelljs/package.json');
  isLocal = false;
}

// Create the prompt
let myprompt = argv.prompt || 'shelljs %v%l $ ';
myprompt = myprompt.replace(/%./g, (function fn() {
  const option = {
    '%%': '%',
    '%v': json.version,
    '%l': (isLocal ? ' [local]' : '')
  };
  return (match) => option[match];
}()));

const replServer = repl.start({
  prompt: myprompt,
  replMode: process.env.NODE_REPL_MODE === 'strict' || argv.use_strict ? repl.REPL_MODE_STRICT : repl.REPL_MODE_MAGIC
});

// save repl history
const HISTORY_FILE = path.join(osHomedir(), '.n_shell_history');
replHistory(replServer, HISTORY_FILE);

// Newer versions of node use a symbol called util.inspect.custom.
const inspectAttribute = util.inspect.custom || 'inspect';

function wrap(fun, key) {
  if (typeof fun !== 'function') {
    return fun; // not a function
  }
    const outerRet = (...args) => {
      const ret = fun.apply(this, args);
      // Polyfill .inspect() method
      function emptyInspect() {
        return '';
      }

      if (ret instanceof Object) {
        let oldInspect;
        if (ret[inspectAttribute]) {
          oldInspect = ret[inspectAttribute].bind(ret);
        } else {
          oldInspect = () => '';
        }
        if (key === 'echo' || key === 'exec') {
          ret[inspectAttribute] = emptyInspect;
        } else if (key === 'pwd' || key === 'which') {
          ret[inspectAttribute] = () => {
            const oldResult = oldInspect();
            return oldResult.match(/\n$/) ? oldResult : oldResult + '\n';
          };
        }
      }
      return ret;
    };
  outerRet[inspectAttribute] = outerRet[inspectAttribute] || function thisFn() { return this(); };
    return outerRet;
}

argv.no_global = argv.no_global || argv.local || argv.n;

// Add inspect() method, if it doesn't exist
if (!argv.noinspect) {
  Object.keys(shell).forEach((key) => {
    try {
      shell[key] = wrap(shell[key], key);
    } catch (e) { /* empty */ }
  });
}

if (argv.no_global) {
  if (typeof argv.no_global !== 'string') argv.no_global = 'shell';
  replServer.context[argv.no_global] = shell;
} else {
  Object.keys(shell).forEach((key) => {
    replServer.context[key] = shell[key];
  });
}

module.exports = replServer;
