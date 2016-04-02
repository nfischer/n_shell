# n\_shell

A node REPL with ShellJS loaded by default.

This was inspired by (and forked from) [n\_](https://github.com/borisdiakur/n_).

## Installation:

It's recommended to install this package globally:

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
shelljs $ shell.ls()
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
shelljs $ $.ls()
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

### But I want to use a different version of shelljs

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
    - `%l`: show ` [local]` if this is installed from a local module (whenever
      the warning message above would be printed)
    - Want more formats options? [Let me
      know](https://github.com/nfischer/n_shell/issues/new) or [send me a
      PR](https://github.com/nfischer/n_shell/compare)
 - `--inspect`: an experimental switch to add a `.inspect()` method to the
    output of each command, to make it look less cluttered. This doesn't change
    the return values, it only changes what they look like on the REPL. For
    example, this transforms this very messy-looking ShellJS v0.7 output:

    ```javascript
    shelljs $ ls();
    [ 'bar',
      'file.txt',
      'foo',
      stdout: 'bar\nfile.txt\nfoo\n',
      stderr: null,
      code: 0,
      to: [Function],
      // Even more methods...
      grep: [Function],
      exec: [Function] }

    shelljs $ cat('file.txt');
    { [String: 'hello world\n']
      stdout: 'hello world\n',
      stderr: null,
      code: 0,
      to: [Function],
      // Even more methods...
      grep: [Function],
      exec: [Function] }

    shelljs $ cat('file.txt').stdout;
    'hello world\n'
    ```

    into something more shell-like:

    ```javascript
    shelljs $ ls();
    bar
    file.txt
    foo

    shelljs $ cat('file.txt');
    hello world

    shelljs $ cat('file.txt').stdout; // all the attributes from before still exist
    'hello world\n'
    ```

    **Note**: the `--inspect` option is not availalbe for `--local` mode. Also,
    if you like the feature, let me know and it may work its way upstream into
    ShellJS if it has enough support. Credit for the idea goes to
    [piranna](https://github.com/piranna).

## History

Similarly to `n_`, `n_shell` stores REPL history under `~/.n_shell_history`.
