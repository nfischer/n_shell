'use strict';

var repl = require('repl');
var argv = require('minimist')(process.argv.slice(2));
var replHistory = require('repl.history');
var osHomedir = require('os-homedir');
var path = require('path');

var shell;
var json;
var isLocal;
try {
  var localShellJS = path.resolve('./node_modules/shelljs');
  shell = require('require-relative')(localShellJS, process.cwd());
  json = require(path.join(localShellJS, 'package.json'));
  isLocal = true;
  console.warn('Warning: using shelljs found at ' + localShellJS);
} catch (e) {
  shell = require('shelljs');
  json = require('shelljs/package.json')
  isLocal = false;
}

// Create the prompt
var myprompt = argv.prompt || 'shelljs %v%l $ ';
myprompt = myprompt.replace(/%./g, (function() {
  var option = {
    '%v': json.version,
    '%l': (isLocal ? ' [local]' : '')
  };
  return function(match) {
    return option[match];
  }
})());

var replServer = repl.start({
  prompt: myprompt,
  replMode: process.env.NODE_REPL_MODE === 'strict' || argv['use_strict'] ? repl.REPL_MODE_STRICT : repl.REPL_MODE_MAGIC
});

// save repl history
var HISTORY_FILE = path.join(osHomedir(), '.n_shell_history');
replHistory(replServer, HISTORY_FILE);

argv.no_global = argv.no_global || argv.local || argv.n;
if (argv.no_global) {
  if (typeof argv.no_global !== 'string')
    argv.no_global = 'shell';
  replServer.context[argv.no_global] = shell;
} else {
  for (var key in shell) {
    replServer.context[key] = shell[key];
  }
}

module.exports = replServer;
