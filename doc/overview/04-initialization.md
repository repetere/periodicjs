# Initializing Your Application

A typical Perioidic application has mutliple extensions, servers and databases. In order for you application to start, all of the resources are loaded asynchronously before your application is ready to be used.

In a typical application, your `app_root/index.js` file will call Periodic's initializaiton function `init`.

```javascript
//sample path/to/app_root/index.js
'use strict';
const periodic = require('periodicjs'); //periodic singleton
periodic.init()
  .then(console.log) //log startup status
  .catch(console.error); //log any errors
```

The initialization process, creates the required folder structure, clusters and forks your application (if configured), loads configurations, loads extensions, connects databases, configures express, and finally starts web and socket servers or runs CLI commands.

```javascript
//The initialization process
const periodicInit = require('./init');
const periodicExtension = require('./extension');

class Periodic{
  constructor(options={}){
    //the singleton object
    /*
    * this.config
    * this.extensions = new Map();
    * this.logger
    * etc - read more about the constructor in the periodic singleton documentation
    */
    return new Proxy(this,periodicProxyHandler);
  }
  init(options={}){
    return new Promise((resolve, reject) => {
      Promisie.series([
          periodicInit.timer.startTimer.bind(this),
          periodicInit.setUpFolderStructure.bind(this),
          periodicInit.config.loadConfiguration.bind(this),
          periodicInit.runtime.configRuntimeEnvironment.bind(this),
          periodicInit.config.loadAppSettings.bind(this),
          periodicInit.logger.configureLogger.bind(this),
          periodicInit.config.loadExtensions.bind(this),
          periodicInit.config.setupGenericCoreController.bind(this),
          periodicExtension.setup.setupExtensions.bind(this),
          periodicExtension.setup.setupContainer.bind(this),
          periodicInit.config.loadDatabases.bind(this),
          periodicInit.logger.catchProcessErrors.bind(this),
          periodicInit.express.initializeExpress.bind(this),
          periodicInit.cli.run.bind(this),
          periodicInit.cluster.forkProcess.bind(this),
          periodicInit.server.initializeServers.bind(this),
          periodicInit.timer.endTimer.bind(this),
        ]).then(resolve)
        .catch(completInit);
    });
  }
}
```

## `periodicInit.timer.startTimer` - Timing Application startup

A simple timer function, to track the performance of your initialization process. Your application should start in less than 3 seconds.

## `periodicInit.setUpFolderStructure` - creating application folder structure 

A function that will setup your application folder structure if it is not currently setup, it will not overwrite existing configs/files.

## `periodicInit.config.loadConfiguration` - Loading the configration database 

A function that reads `app_root/content/config/config.json` or `app_root/content/config/config.js` in order to configure your application.

Because your configuration file can either be a JSON file or a javascript module (if it exports a function, it must return a promise) you can load the initial configuration from any resource (even asynchronously).


## `periodicInit.runtime.configRuntimeEnvironment` - Setting your runtime environment

A function sets the application runtime environment, and saves the last runtime environment in the configuration database in the file `content/config/process/runtime.json`

Periodic will prioritize loading the runtime environment via command line argument first, and then environment variables, and finally it will use the last runtime environment

```
$ node index.js development
```
```
$ NODE_ENV=development node index.js
```
```
$ ENV=development node index.js
```
```
$ node index.js -e development
```
```
$ node index.js --e=development
```

## `periodicInit.config.loadAppSettings` - Loading application settings

The settings for Periodic are on the `periodic.settings` property. The applicatication settings are assigned by merging default settings, environment settings and override settings.

Default Settings -> Environment Settings -> Override Settings -> Application Settings

* **Default settings** are stored in  `app_root/node_modules/periodicjs/lib/defaults/environment.js` and cannot be modified
* **Environment settings** are set in the configuration database in the `content/config/environment/{name-of-environment}.json`
* **Override settings** are set on the _settings_ property in `content/config/config.json` or `content/config/config.js`


## `periodicInit.logger.configureLogger` - Configure winston logger

configure winston

## `periodicInit.periodicInit.config.loadExtensions` - Load extensions from DB

load settings from teh db

## `periodicInit.config.setupGenericCoreController` - Initialize helper controller functions

core controller

## `periodicInit.setup.setupExtensions` - Configure winston logger

asd

## `periodicInit.setup.setupContainer` - Configure winston logger

asd

## `periodicInit.config.loadDatabases` - Configure winston logger

asd

## `periodicInit.logger.catchProcessErrors` - Configure winston logger

asd
## `periodicInit.express.initializeExpress` - Configure winston logger

asd

## `periodicInit.cli.run` - Configure winston logger

asd

## `periodicInit.cluster.forkProcess` - Configure winston logger

asd

## `periodicInit.server.initializeServers` - Configure winston logger

asd

## `periodicInit.timer.endTimer` - Configure winston logger

asd


NEXT: [ Customizing Your Application ](https://github.com/repetere/periodicjs/blob/master/doc/overview/05-customization.md)
