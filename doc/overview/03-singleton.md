## Overview

The Periodic node module is a javascript singleton that provides a declarative framework for quickly building enterprise database agnostic applications.

The periodic node module is a singleton, and once initialized, exposes several helpful properties to declaratively build your application.

```javascript
//The Periodic Singleton
const periodic = require('periodicjs');

//periodic
{
  config, // runtime environment information, and conection to configuration and extension internal databases
  settings, // application settings for express, added extensions and containers
  utilities,
  express, // express reference
  app, // periodic's express app
  status, // event listener
  controllers, // middleware functions for express (core controller, extension controllers and container controllers)
  resources, // CLI tasks
  locals, // local variables passed to express
  routers, // express routers from core, containers and extensions
  containers, // map of loaded containers
  extensions, // map of loaded extensions
  servers, // map of loaded servers (http, https, websockets)
  datas, // map of core data database models
  dbs, // map of connected databases
  tasks, // internal periodic helper functions
  transforms, // data transform functions from extensions and containers
  crud, // internal persistant storage helper methods
  logger, // winston logger
  core // core built-in functionality
}
```

Periodic applications are generally comprised of Extensions, Extensions are node modules that extend the core functionality of Periodic.

NEXT: [ Configuration ](https://github.com/typesettin/periodicjs/blob/master/doc/configuration/01-overview.md) 
