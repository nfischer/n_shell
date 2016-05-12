# n\_shell

A node REPL with ShellJS loaded by default.

This was inspired by (and forked from) [n\_](https://github.com/borisdiakur/n_).

## Like it?

Give it a star [on Github](https://github.com/nfischer/n_shell)

## Installation:

I recommend installing this package globally:

```Bash
$ npm install -g n_shell
```

## Usage:

Invoking `n_shell` starts a node REPL with ShellJS required globally:

```javascript
bash $ n_shell
shelljs $ ls()
[ 'LICENSE',
  'README.md',
  'bin',
  'node_modules',
  'package.json',
  'src',
  'tmp' ]
shelljs $ pwd()
'/path/to/dir'
```

### But I don't want to use `shelljs/global`

No problem:

```javascript
bash $ n_shell --no_global
shelljs $ typeof ls // not in the global namespace
'undefined'
shelljs $ shell.ls() // uses 'shell' prefix
[ 'LICENSE',
  'README.md',
  'bin',
  'node_modules',
  'package.json',
  'src',
  'tmp' ]
shelljs $ shell.pwd()
'/path/to/dir'
```

### But I want to use a different namespace

You're covered:

```javascript
bash $ n_shell --no_global=$
shelljs $ $.ls() // now uses '$' as the prefix
[ 'LICENSE',
  'README.md',
  'bin',
  'node_modules',
  'package.json',
  'src',
  'tmp' ]
shelljs $ $.pwd()
'/path/to/dir'
```

### But I want to use a different version of ShellJS

Just install that version locally (`npm install shelljs`) and start up
`n_shell`. You should see a warning message like this:

```
bash $ n_shell
Warning: using shelljs found at /path/to/dir/node_modules/shelljs
shelljs $
```

## Available commands

This supports any command that ShellJS supports. It also adds some extra
commands, for convenience. So far, this adds:

 - `clear()`/`shell.clear()` (from
   [bahamas10/node-clear](https://github.com/bahamas10/node-clear))

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
    - Want more formats options? [Let me
      know](https://github.com/nfischer/n_shell/issues/new) or [send me a
      PR](https://github.com/nfischer/n_shell/compare)
 - `--inspect`: an experimental switch to add a `.inspect()` method to the
    output of each command. The return values are still ShellStrings, but appear
    more readable and shell-like. Also, commands with no arguments can be
    invoked without parentheses, such as `shell.pwd` and `shell.ls`. Recommended
    for ShellJS v0.7+. Credit for the idea goes to
    [piranna](https://github.com/piranna).

## History

Similarly to `n_`, `n_shell` stores REPL history under `~/.n_shell_history`.
