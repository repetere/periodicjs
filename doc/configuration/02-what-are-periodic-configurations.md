# What are Periodic Extensions?

Extensions have seven major features. Once an extension is initialized, the extension's features are availble in your periodic application.
1. Commands
2. Configurations
3. Controllers
4. Routers
5. Transforms
6. Utilities
7. Views

## 1. Commands - Asynchronous tasks available to Periodic's CLI

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

## 1. Configurations - custom settings for extensions including custom databases

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

### Configuring extension settings

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

### Configuring custom extension databases

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

## 3. Controllers - milddleware functions

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

## 4. Routers - Express routers

In periodic's initialization process

## 5. Transforms - Asynchronous tasks available to Periodic's CLI

A command is a function that is mounted to your periodic application during initialization. Commands are available as CLI tasks through periodic's CLI.

## 6. Utilities - Asynchronous tasks available to Periodic's CLI

A command is a function that is mounted to your periodic application during initialization. Commands are available as CLI tasks through periodic's CLI.

## 7. Views - Asynchronous tasks available to Periodic's CLI

A command is a function that is mounted to your periodic application during initialization. Commands are available as CLI tasks through periodic's CLI.

NEXT: [ How do Periodic Configurations work? ](https://github.com/typesettin/periodicjs/blob/master/doc/configurations/03-how-do-periodic-configurations-work.md)
