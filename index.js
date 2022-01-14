#!/usr/bin/env node
'use strict';

// ShellJS plugins
require('shelljs-plugin-clear');
require('shelljs-plugin-inspect');
require('shelljs-plugin-open');
require('shelljs-plugin-sleep');

var util = require('util');
var repl = require('repl');
var argv = require('minimist')(process.argv.slice(2));
var replHistory = require('repl.history');
var osHomedir = require('os-homedir');
var path = require('path');

var shell;
var json;
var isLocal;
try {
  if (argv.path[0] === '~')
    argv.path = argv.path.replace('~', osHomedir());
  var localShellJS = path.resolve(argv.path);
  shell = require('require-relative')(localShellJS, process.cwd());
  json = require(path.join(localShellJS, 'package.json'));
  isLocal = true;
} catch (e) {
  shell = require('shelljs');
  json = require('shelljs/package.json');
  isLocal = false;
}

// Create the prompt
var myprompt = argv.prompt || 'shelljs %v%l $ ';
myprompt = myprompt.replace(/%./g, (function() {
  var option = {
    '%%': '%',
    '%v': json.version,
    '%l': (isLocal ? ' [local]' : '')
  };
  return function(match) {
    return option[match];
  };
})());

var replServer = repl.start({
  prompt: myprompt,
  replMode: process.env.NODE_REPL_MODE === 'strict' || argv.use_strict ? repl.REPL_MODE_STRICT : repl.REPL_MODE_MAGIC
});

// save repl history
var HISTORY_FILE = path.join(osHomedir(), '.n_shell_history');
replHistory(replServer, HISTORY_FILE);

// Newer versions of node use a symbol called util.inspect.custom.
var inspectAttribute = util.inspect.custom || 'inspect';

function wrap(fun, key) {
  if (typeof fun !== 'function') {
    return fun; // not a function
  } else {
    var outerRet = function() {
      var ret = fun.apply(this, arguments);
      if (ret instanceof Object) {
        // Polyfill .inspect() method
        function emptyInspect() {
          return '';
        }
        var oldInspect;
        if (ret[inspectAttribute]) {
          oldInspect = ret[inspectAttribute].bind(ret);
        } else {
          oldInspect = function() { return ''; }
        }
        if (key === 'echo' || key === 'exec') {
          ret[inspectAttribute] = emptyInspect;
        } else if (key === 'pwd' || key === 'which') {
          ret[inspectAttribute] = function () {
            var oldResult = oldInspect();
            return oldResult.match(/\n$/) ? oldResult : oldResult + '\n';
          };
        }
      }
      return ret;
    };
    outerRet[inspectAttribute] = outerRet[inspectAttribute] || function () { return this(); };
    return outerRet;
  }
}

argv.no_global = argv.no_global || argv.local || argv.n;

// Add inspect() method, if it doesn't exist
if (!argv.noinspect) {
  for (var key in shell) {
    try {
      shell[key] = wrap(shell[key], key);
    } catch (e) {}
  }
}

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
