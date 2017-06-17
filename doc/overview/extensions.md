# Extensions

Extensions are used to add functionality to your periodic application. Extensions are loaded, initialized, configured and mounted during the periodic initialization process.

Extensions are typically stitched together to build a customized web application or API.

* What are Periodic Extensions?
* How do Periodic Extensions work?
* How are Extensions loaded?
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

In some situations, extensions need their own databases (e.g. for logging, for caching, shopping carts, etc)

The databases setting property is identical to the database setting property in your periodic configuration .

Custom database models are located in `name-of-extension/config/databases/[name-of-database]/models` directory

Sample extension configuration with custom databases
```javascript
'use strict';
module.exports = {
  settings: {
    use_logging:true,
    validate_customers:true,
    use_transaction_history:true,
  },
  databases: {
    error_log_db: {
      db: 'mongoose',
      options: {
        url: 'mongodb://localhost:27017/custom_db_logs',
        mongoose_options: {},
      },
      controller: {
        default: {
          protocol: {
            adapter: 'http',
            api: 'rest',
          },
          responder: {
            adapter: 'json',
          },
        },
      },
      router: {
        ignore_models: [],
      },
    },
    transactions: {
      db: 'sequelize',
      options: {
        database: 'store_orders_db',
        username: '',
        password: '',
        connection_options: {
          dialect: 'postgres',
          port: 5432,
          host: '127.0.0.1',
          logging: true,
        },
      },
      controller: {
        default: {
          protocol: {
            adapter: 'http',
            api: 'rest',
          },
          responder: {
            adapter: 'json',
          },
        },
      },
      router: {
        ignore_models: [],
      },
    },
    shopping_cart: {
      db: 'lowkie',
      options: {
        dbpath: 'content/config/settings/shopping-cart_db.json',
        dboptions: {
          verbose: true,
        },
      },
        controller: {
          default: {
            protocol: {
              adapter: 'http',
              api: 'rest',
            },
            responder: {
              adapter: 'json',
            },
          },
        },
        router: {
          ignore_models: [],
        },
      },
  },
};
```

### 3. Controllers - milddleware functions

During initialization, an extension's controllers are 

```javascript
//You can access extensions commands from resources
periodic.controllers.extension; // Map of extension middleware controllers
```
Controllers are usually added to an express router, but many extensions export controllers that are intended to be used in custom routes (for example the passport extension)

```javascript
const requireAuthentication = periodic.controllers.extension.get('periodicjs.ext.passport').authenticationRequired;
const myRouter = periodic.express.Router();

myRouter.get('/auth-required',requireAuthentication,(req,res)=>{
  res.send('you are logged in!');
});
```

### 4. Routers - Express routers

In periodic's initialization process

### 5. Transforms - Asynchronous tasks available to Periodic's CLI

A command is a function that is mounted to your periodic application during initialization. Commands are available as CLI tasks through periodic's CLI.

### 6. Utilities - Asynchronous tasks available to Periodic's CLI

A command is a function that is mounted to your periodic application during initialization. Commands are available as CLI tasks through periodic's CLI.

### 7. Views - Asynchronous tasks available to Periodic's CLI

A command is a function that is mounted to your periodic application during initialization. Commands are available as CLI tasks through periodic's CLI.

## How are Extensions loaded?

During the periodic initialization process, your application will query the extension database and will retrieve a sorted list of extensions.

Extensions are sorted by the extension type and extension priority. 

Only valid extensions, and extensions who's dependencies are loaded, will be mounted on periodic's extension map (`periodic.extensions`).

```javascript
//During initialization, periodic's configuration LoadExtensions function, uses periodic's internal crud services to pull extensions in the correct order
periodic.crud.ext.list()
  .then(extensions=> checkExtensionDependencies)
  .catch(periodic.logger.error);

// the crud call queries the extension core data db for sorted extensions
periodic.datas.get('extension')
  .search({
    query: {},
    sort: {
      periodic_type: 1,
      periodic_priority: 1,
    },
  })
  .then(resolve)
  .catch(reject);

//checkExtensionDependencies will add an extension to the extension map if valid
periodic.extensions = new Map();

function checkExtensionDependencies(extension){
  if(semver.lt(periodic.settings.application.version,extension.periodic_compatibility) && // test to make sure if the extension is compatible with your version of periodic
  checkForRequiredExtensions(extension.periodic_dependencies)
  ){
    periodic.extensions.set(extension.name,extension);
  }
}
```

### periodicjs.ext.json

Each valid extension must contain an extension manifest json. This manifest defines an extension's type, priority, periodic compatibility, dependencies and shared configurations.

Sample `periodicjs.ext.json`
```javascript
{
  "periodic_compatibility": "10.0.0",
  "periodic_dependencies": [],
  "periodic_type": 7,
  "periodic_priority": 0,
  "periodic_config": {
  }
}
```

### Checking periodic compatibility (`"periodic_compatibility":"10.0.0"`)

An extension must declare which version of periodic it's compatibile with. If an extension is not compatible with your version of periodic, if you're are debugging output, a warning will be logged. Incompatible extension will not be loaded into the extension map `periodic.extensions`. 

### Checking extension dependencies

**periodic_dependencies** is an array of objects that define which extensions are required for the extension to work

```javascript
  "periodic_dependencies": [{
    "extname": "periodicjs.ext.mailer",
    "version": "~10.0.0",
    "optional":true,
  }, {
    "extname": "periodicjs.ext.login",
    "version": "~11.0.0"
  }, {
    "extname": "periodicjs.ext.uac",
    "version": "~7.0.0"
  }, {
    "extname": "periodicjs.ext.oauth2server",
    "version": "5.0.0"
  }],
```

* extname - the name of the required extension
* version - a valid semver of the extension node module
* optional - if the dependency is optional or not

### Extension Types (`"periodic_type"`)

Extension types are used to prioritize the order in which extension resources are mounted in periodic's express instance.

Because in express, the order in which middleware functions are pushed onto the stack, it's important to define the order.

Extension types must be a Number (either 0,1,2,3,4,5,6,7).

0. Core - these extensions typically overwrite the default periodic functionality (like how files are uploaded)
1. Communication - extensions that manipulation how information is sent (email, sms, etc)
2. Authorization - extensions that manage req.user 
3. User Access Control - manipulation of req.userprivileges
4. API - API Helpers 
5. Admin - Database administration extensions
6. Data - extensions that deal with data
7. UI - UI based extensions

### Extension Priorities (`"periodic_priority"`)

Extension Priorities are a way to prioritize how extensions of the same type should be loaded, for example if you're using two Authorization (`"periodic_type":2`) extension, one might have to be loaded before another.

A good example is a login extension and another login extension that extends the original login extension with two factor authentication

### Extension Shared Configs (`"periodic_config"`)

Extensions will export configurations so they will be mounted in the extension map, this is used to add additional views in an admin ui for example.

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

