# n\_shell

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/nfischer/n_shell/main.yml?style=flat-square&logo=github)](https://github.com/nfischer/n_shell/actions/workflows/main.yml)
[![Codecov](https://img.shields.io/codecov/c/github/nfischer/n_shell.svg?style=flat-square)](https://codecov.io/gh/nfischer/n_shell)
[![npm version](https://img.shields.io/npm/v/n_shell.svg?style=flat-square)](https://www.npmjs.com/package/n_shell)
[![npm downloads](https://img.shields.io/npm/dt/n_shell.svg?style=flat-square)](https://www.npmjs.com/package/n_shell)

A node REPL with ShellJS loaded by default.

This was inspired by (and forked from) [n\_](https://github.com/borisdiakur/n_).

## Like it?

Give it a star [on Github](https://github.com/nfischer/n_shell)

## Installation:

```Bash
$ npm install -g n_shell
```

## Usage:

Invoking `n_shell` starts a node REPL with ShellJS required globally, with
shell-like output:

```Bash
bash $ n_shell
shelljs $ ls()
LICENSE
README.md
bin
node_modules
package.json
src
tmp
shelljs $ pwd()
/path/to/dir
```

### But I don't want to use `shelljs/global`

No problem:

```
bash $ n_shell --no_global
shelljs $ typeof ls // not in the global namespace
'undefined'
shelljs $ shell.ls() // uses 'shell' prefix
LICENSE
README.md
bin
node_modules
package.json
src
tmp
shelljs $ shell.pwd()
/path/to/dir
```

### But I want to use a different namespace

You're covered:

```
bash $ n_shell --no_global=$
shelljs $ $.ls() // now uses '$' as the prefix
LICENSE
README.md
bin
node_modules
package.json
src
tmp
shelljs $ $.pwd()
/path/to/dir
```

### But I want to use a different version of ShellJS

Just install that version locally (`npm install shelljs`) and start up
`n_shell` with the `--path` option:

```
bash $ n_shell --path=node_modules/shelljs
shelljs $
```

### But I want plain JavaScript output

```javascript
bash $ n_shell --noinspect
shelljs $ ls()
[ 'LICENSE',
  'README.md',
  'index.js',
  'node_modules',
  'package.json',
  stdout: 'LICENSE\nREADME.md\nindex.js\nnode_modules\npackage.json\n',
  stderr: null,
  code: 0,
  to: [Function],
  toEnd: [Function],
  cat: [Function],
  head: [Function],
  sed: [Function],
  sort: [Function],
  tail: [Function],
  grep: [Function],
  exec: [Function] ]
```

## Available commands

This supports any command that ShellJS supports. It also adds some extra
commands, for convenience. So far, this adds:

 - `shell.clear()` (from
   [shelljs-plugin-clear](https://github.com/nfischer/shelljs-plugin-clear))
 - `shell.open()` (from
   [shelljs-plugin-open](https://github.com/shelljs/plugin-open))
 - `shell.sleep()` (from
   [shelljs-plugin-sleep](https://github.com/nfischer/shelljs-plugin-sleep))

## Options

 - `--global`: Start a node REPL with the equivalent of
   `require('shelljs/global')`. This is the default behavior.
 - `--no_global [PREFIX]`, `--local [PREFIX]`, `-n [PREFIX]`: Start a node REPL
   with the equivalent of `var PREFIX = require('shelljs')`. `PREFIX` defaults
   to `shell`, if not specified.
 - `--use_strict`: enforce strict mode (default is false)
 - `--prompt <FORMAT>`: use this format to generate the REPL prompt. Default is
   "`shelljs %v%l $ `"
    - `%%`: a literal `%` sign
    - `%v`: show the current version (from `package.json`)
    - `%l`: show ` [local]` if this is using a local version of ShellJS
    - Want more format options? [Let me
      know](https://github.com/nfischer/n_shell/issues/new) or [send me a
      PR](https://github.com/nfischer/n_shell/compare)
 - `--noinspect`: disable the default `--inspect` behavior. This provides
   less-readable REPL output, but behaves just as a standard Node REPL would.
 - `--path=path/to/shelljs/`: the argument should be a path to a folder
   containing a ShellJS package.
 - `--inspect` (default): an experimental switch to add a `.inspect()` method to
   the output of each command. The return values are still ShellStrings, but
   appear more readable and shell-like. Also, commands with no arguments can be
   invoked without parentheses, such as `shell.pwd` and `shell.ls`. Recommended
   for ShellJS v0.7+. Credit for the idea goes to
   [piranna](https://github.com/piranna).

## History

Similarly to `n_`, `n_shell` stores REPL history under `~/.n_shell_history`.
