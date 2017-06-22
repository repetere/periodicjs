# Overview

The Periodic node module (`periodicjs`) is a javascript [singleton](http://www.dofactory.com/javascript/singleton-design-pattern) that provides a declarative framework for quickly building enterprise database agnostic applications.

Periodic is extremely customizable, and supports [polyglot persistence](http://www.jamesserra.com/archive/2015/07/what-is-polyglot-persistence/) (built in support for Mongo, Redis, SQL, Loki) and multiple transport mechanisms (REST, JSON-RPC, XML-RPC) over HTTP, HTTPS and WebSockets.

The extreme flexibility is what enables Periodic to be used for various applications API Servers, Authentication Servers, E-Commerce platforms, Mobile application backends servers, microservices, Core banking platforms, advanced CMS replacements, CRMs, ERPs, ELPs, GRPs and ECMS.

* [ The Periodic Singleton ](https://github.com/typesettin/periodicjs/blob/master/doc/overview/03-singleton.md)
* [ Initializing Your Application ](https://github.com/typesettin/periodicjs/blob/master/doc/overview/04-initialization.md)
* [ Customizing Your Application ](https://github.com/typesettin/periodicjs/blob/master/doc/overview/05-customization.md)

# How Periodic Works

* [ Configuration ](https://github.com/typesettin/periodicjs/blob/master/doc/configuration/01-overview.md) 
* [ Extensions ](https://github.com/typesettin/periodicjs/blob/master/doc/extensions/01-overview.md) 
* ~~Containers (COMING SOON)~~
* [ Command Line Interface & REPL ](https://github.com/typesettin/periodicjs/blob/master/doc/overview/command-line-interface.md) 
* ~~Advanced (COMING SOON)~~
  * [ Testing & Developing new Periodic features ](https://github.com/typesettin/periodicjs/blob/master/doc/advanced/00-testing-developing.md)
  * ~~Deploying your application (COMING SOON)~~
  * ~~Migrating from legacy applications~~
    * ~~Wordpress~~
    * ~~Drupal~~
    * ~~Teamsite~~
    * ~~Adobe CQ5 / Experience Manager~~
  * ~~Glossary (COMING SOON)~~

NEXT: [ The Periodic Singleton ](https://github.com/typesettin/periodicjs/blob/master/doc/overview/03-singleton.md)

# Cheatsheet

```javascript
//The Periodic Class - periodicjs/lib/periodicClass.js
const periodic = require('periodicjs');

//periodic
{
  config, // runtime environment information, and conection to configuration and extension internal databases
  settings:{ // application settings for express, added extensions and containers
    application, //application and server settings
    logger,// custom winston logger settings
    express,//express application settings
    periodic,//general periodic settings
    databases,// database configurations
    extensions,// loaded extension settings are assigned here
    container,//container configurations are assigned here
  }, 
  utilities, // helper functions
  express, // express reference - require('express')
  app, // periodic's express app - express()
  status, // event listener - new events.EventEmitter();
  controllers:{ //controllers are middleware functions for express routes
    core, //core data controllers - new Map();
    extension, //loaded extensions middleware functions - new Map();
    container, // loaded container middleware functions - new Map();
  }, // middleware functions for express (core controller, extension controllers and container controllers)
  resources:{
    standard_models:[]//additional standard database model file paths from extensions and containers
    databases:{
      extensions, //custom database configurations from loaded extensions
      container,  //custom database configurations from a container
    },
    commands:{
      extensions, // mounted CLI commands from extensions - new Map()
      container, // mounted CLI commands from your container - new Map()
    }
  }, // CLI tasks
  locals:{
    core, // local variables passed to express
    extensions, // mounted utilities from extensions - new Map();
    container, // mounted utilities from container - new Map();
  }, 
  routers, // express routers from core, containers and extensions - new Map()
  containers, // map of loaded containers - new Map()
  extensions, // map of loaded extensions - new Map()
  servers, // map of loaded servers (http, https, websockets) - new Map()
  datas, // map of core data database models - new Map()
  dbs, // map of connected databases - new Map()
  tasks, // internal periodic helper functions
  transforms:{ // data transform functions from extensions and containers
    pre:{ // pre data retrival request transform functions for HTTP methods
      CONNECT, DELETE, GET, HEAD, OPTIONS, POST, PUT,
    },
    post:{ // post data retrival response transform functions for HTTP methods, 
      CONNECT, DELETE, GET, HEAD, OPTIONS, POST, PUT,
    },
  }, 
  crud:{ // internal persistant storage helper methods
    config:{
      create, // helper method for adding config to config db
      update, // helper method for updating config from config db
      remove, // helper method for removing config from config db
      get, // helper method for loading config from config db
      list, // helper method for loading sorted configs
      init, // helper method for creating new configs
    },
    ext:{
      create, // helper method for adding extension to extension db
      update, // helper method for updating extension from extension db
      remove, // helper method for removing extension from extension db
      get, // helper method for loading extension from extension db
      list, // helper method for loading sorted extensions
      init, // helper method for creating new extensions
    },
    con:{
      create, // helper method for adding container to config db
      update, // helper method for updating container from config db
      remove, // helper method for removing container from config db
      get, // helper method for loading container from config db
      init, // helper method for creating new containers
    },
  },
  logger, // winston logger
  core:{ // core built-in functionality
    assets, //helper functions for dealing with files
    data, //helper module for dealing with database models
    communication, //helper module for dealing with sending mail/messages
    cache, //helper module for caching
  } 
}
```

