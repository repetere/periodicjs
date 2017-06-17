# Extensions

Extensions are used to add functionality to your periodic application. Extensions are loaded, initialized, configured and mounted during the periodic initialization process.

Extensions are typically stitched together to build a customized web application or API.

* What are Periodic Extensions?
* What are some common Extensions?
* Installing Extensions
* Removing Extensions
* Configuring Extensions
* Creating Extensions

## What are Periodic Extensions?

Extensions have seven major features. Once an extension is initialized, the extension's features are availble in your periodic application.
1. Commands
2. Configurations
3. Controllers
4. Routers
5. Transforms
6. Utilities
7. Views

### 1. Commands - Asynchronous tasks available to Periodic's CLI

A command is a function that is mounted to your periodic application during initialization. Commands are available as CLI tasks through periodic's CLI.

```javascript
//You can access extensions commands from resources
periodic.resources.commands.extensions; // Map of extenion commands

//referencing a single command
periodic.resources.commands.extensions.get('[name-of-extesion]')['name-of-command']; // this is a function that returns a promise

//during the initialization process, when your application is loading extenstions it loads commands from your extensions command direcotry

//for example the extension dbseed
const dbseedCommands = require('periodicjs.ext.dbseed/commands/index'); //has an import and an export command
periodic.resources.commands.extensions.set('periodicjs.ext.dbseed',dbseedCommands);

//using a command
periodic.resources.commands.extensions.get('periodicjs.ext.dbseed').export('path/to/some/seedfile.json')
  .then(console.log)
  .catch(console.error);
```

E.g. calling command from the CLI

```
$ periodicjs extension periodicjs.ext.dbseed export path/to/some/seedfile.json
```
E.g. calling command from the REPL

```javascript
$p.resources.commands.extensions.get('periodicjs.ext.dbseed').export('path/to/some/seedfile.json').then(console.log).catch(console.error);
```

### 1. Configurations - custom settings for extensions including custom databases

Extension configurations are required to have two properties `settings` and `databases`

Sample `settings.js`
```javascript
module.exports = {
  settings: {
  },
  databases: {
  },
};
```

#### Configuring extension settings

```javascript
// once initialized, extension settings are assigned to a name spaced property on your applications extensions setting property
periodic.settings.extensions['name-of-extension'];
```

Just like your periodic application, extension settings are composed of default settings, environment settings and override settings
```
Default Settings -> Environment Settings -> Override Settings -> Extension Settings
```

The default settings for an extension are defined in the extensions `name-of-extension/config/settings.js` file.

Environment settings are stored in the configuration database under the filepath `content/config/extension content/config/extension/[name-of-extension]/[runtime-environemnt].json`

Override Settings are stored in your global override settings `content/config/config.json` under the `settings.extensions['name-of-extension']` property

#### Configuring custom extension databases

## What are some common Extensions?

In Periodic10 there are no restrictions on the naming convention for extensions, but they are typically prefixed with `periodicjs.ext`

* periodicjs.ext.packagecloud 
  * An extension for using packagecloud to upload files to a numerous cloud storage service providers (e.g. Amazon S3).
* periodicjs.ext.passport 
  * An extension for using passport to handle user authentication via multple authentication strategies (OAuth, OAuth2, Social Signin [Facebook, Twitter, Google, etc], Single Sign-On).
* periodicjs.ext.oauth2client 
  * The ability to authenticate users with OAuth2.
* periodicjs.ext.oauth2server 
  * An extension enabling your application to serve as an OAuth2 server.
* periodicjs.ext.reactadmin 
  * A React based Single Page Application Admin UI for your web application, with auto-generated views based off of your database models.
* periodicjs.ext.user_access_control 
  * An extension for providing granular ACL within your application
* periodicjs.ext.basicadmin 
  * A very basic admin ui based off of your database models.
* periodicjs.ext.dbseed 
  * An export/import data extension for loading data into your application

## `$ periodicjs addExtension [name-of-extension]` - Installing extensions

```console
$ cd path/to/application_root
$ npm i [name-of-extension]
$ periodicjs addExtension [name-of-extension]
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --crud=ext --crud_op=create --crud_arg=[name-of-extension] 
```

The `repl` CLI command creates an interactive shell with access to your fully initialized periodic application

```javascript
const repl = require('repl');
const r = repl.start('$p > ');
r.context.$p = periodic;
```

## `$ periodicjs commands` - asynchronous mounted tasks

```console
$ periodicjs command extension periodicjs.ext.dbseed import path/to/seedfile.json
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

## `$ periodicjs crud` - internal storage helpers

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

There are a number of helper crud methods

* `$ periodicjs addExtension periodicjs.ext.dbseed`
* `$ periodicjs removeExtension periodicjs.ext.dbseed`
* `$ periodicjs addContainer react-single-page-theme`
* `$ periodicjs removeContainer react-single-page-theme`

