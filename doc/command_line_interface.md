# Command Line Interface

Periodic comes with a built in Command Line Interface (CLI) with three main features
* REPL - an interactive shell
* CRUD - access to periodic's internal persistent storage faculties
* Tasks - access to mounted asychronous methods from extensions and containers.

## $ periodicjs repl - interactive periodic shell

```console
$ periodicjs repl
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --repl 
```

The `repl` CLI command creates an interactive shell with access to your fully initialized periodic application

```javascript
const repl = require('repl');
const r = repl.start('$p > ');
r.context.$p = periodic;
```

## $ periodicjs commands - asynchronous mounted tasks

```console
$ periodicjs command ext periodicjs.ext.dbseed import path/to/seedfile.json
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --command --ext --name=periodicjs.ext.dbseed --task=import --args 
```

The `commands` CLI command calls mounted asynchronous procedures called **tasks** from your periodic application during start up. Extensions and Containers tasks are mounted from exported asynchronous functions located in `[name-of-ext||name-of-container]/tasks/index.js`.

```javascript
//parsed command line arguments 
const options = {
  argv: {
    cli: true, //required
    command: true, //required
    ext: true, //optional
    container: true, //optional
    name: 'name of container or extension', //required
    task: 'name of cli command async function', //required
    args: 'arguments passed to command function' //optional
  }
};

//method called:
const commandType = (options.argv.ext) ? 'extensions' : 'container';
periodic.resources.commands[commandType]
  .get(options.argv.name)[options.argv.task]
  .call(periodic, options.argv.args)
    .then(periodic.logger.info)
    .catch(periodic.logger.error);
```

## $ periodicjs crud

```console
$ periodicjs crud extension create periodicjs.ext.dbseed
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --crud=extension --crud_op=create --crud_arg=periodicjs.ext.dbseed 
```

The `crud` command calls the internal periodic persistence storage methods. Periodic's CRUD functions are used to create, retrieve, update, delete configurations and extensions

```javascript
//parsed command line arguments 
const options = {
  argv: {
    cli: true, //required
    crud: 'ext'||'config'||'con', //required
    crud_op: 'create'||'remove'||'update'||'get'||'list'||'init', //required
    crug_arg: 'arguments passed to command function' //optional
  }
};

//method called:
periodic.crud[options.argv.crud][options.argv.crud_op](options.argv.crud_arg)
    .then(periodic.logger.info)
    .catch(periodic.logger.error);
```

