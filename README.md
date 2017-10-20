Periodic is a library for rapidily developing database agnostic enterprise  applications and APIs with express & node.js. 
===================================
[![Build Status](https://travis-ci.org/typesettin/periodicjs.svg?branch=master)](https://travis-ci.org/typesettin/periodicjs) [![NPM version](https://badge.fury.io/js/periodicjs.svg)](http://badge.fury.io/js/periodicjs) [![Downloads Per Month](https://img.shields.io/npm/dm/periodicjs.svg?maxAge=2592000)](https://www.npmjs.com/package/periodicjs) [![npm](https://img.shields.io/npm/dt/periodicjs.svg?maxAge=2592000)]() [![Coverage Status](https://coveralls.io/repos/github/typesettin/periodicjs/badge.svg?branch=master)](https://coveralls.io/github/typesettin/periodicjs?branch=master) [![Join the chat at https://gitter.im/typesettin/periodicjs](https://badges.gitter.im/typesettin/periodicjs.svg)](https://gitter.im/typesettin/periodicjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Download Stats](https://nodei.co/npm/periodicjs.png?downloads=true&downloadRank=true)](https://www.npmjs.com/package/periodicjs)

## Getting Started



![Getting started](https://raw.githubusercontent.com/typesettin/periodicjs/master/doc/images/getting-started/01-setup-install.gif)

With Periodic 10, you can get up and running with periodic with zero configuration. It takes 30 seconds to create your first application server with periodic.

```console
$ npm install periodicjs -g 
$ periodicjs setup [name-of-application] 
$ cd [name-of-application]
$ npm install
$ npm start [name of environment]
```

### The four step install
1. Install periodic globally to use the Command Line Interface (CLI)
2. Create a new application
3. Change directory to your new **application root** and Install periodic's dependencies
4. Start your application

#### 1. Install periodic globally to use the CLI (optional) 

```
$ npm install periodicjs -g 
```
Periodic comes with a built in CLI, REPL and other tools to fast track development. Using the CLI is completely optional. 

#### 2. Create a new node application with the CLI (optional)

```
$ periodicjs setup [name-of-application]
```
The `setup` command will create a zero-configuration scaffolded node.js web application.
* The `setup` command create's a new directory for your application, this directory is what is referred to as the `app_root` or your **application root**.
* After your `app_root` directory is created, two scaffolded `package.json` and `index.js` files are created  

##### index.js
```javascript
//example ES6 import periodic from 'periodic'; //periodic singleton
//example index.js - ES5
'use strict';
const periodic = require('periodicjs'); //periodic singleton
periodic.init()
  .then(console.log.bind(console)) //log startup status
  .catch(console.error.bind(console)) //log any errors
```

##### package.json
```json
{
  "name": "[name-of-application]",
  "description": "Simple app server.",
  "version": "0.0.1",
  "main": "index.js",
  "engines": {
    "node": "^6.x"
  },
  "scripts": {
    "start": "node index.js --e",
    "test": "mocha -R spec --recursive"
  },
  "dependencies": {
    "periodicjs": "^10.0.0"
  }
}
```

#### 3. Change directory to your new **application root** and install periodic dependencies

```
$ cd [name-of-application] 
$ npm install
```

The scaffolded `package.json` file only has one dependency **periodicjs**. In order to use multiple databases you may need to install other dependencies (read more about configuring periodic). 


#### 4. Start your application 

```
$ npm start [name of environment]
```

Periodic requires a runtime environment to be defined when your application starts. Your periodic application can have an unlimited number of environments all with different configuration settings. 


# Cheatsheet

### Runtime options
```
$ node index.js development
$ NODE_ENV=development node index.js
$ ENV=development node index.js
$ node index.js -e development
$ node index.js --e=development
```



### Custom controller middleware view rendering
```javascript
const periodic = require('periodicjs');

function someMiddleWareFunction(req, res){
  const viewtemplate = 'user/profile';
  const viewdata = req.user.profile;
  periodic.core.controller.renderView(req, res, viewtemplate, viewdata);
}
```

### Extensions / Containers
```console
$ periodicjs [extension|ext|container|con] [name] [task] [args]
$ periodicjs extension periodicjs.ext.dbseed export path/to/some/seedfile.json
---
$ npm i [name-of-extension]
$ periodicjs addExtension [name-of-extension]
---
$ npm rm [name-of-extension]
$ periodicjs removeExtension [name-of-extension]
---
$ periodicjs createExtension [name-of-extension]
```

### Configurations
```console
$ periodicjs createConfig [type] [name] [environment] [filepath]
---
$ periodicjs createConfig ext periodicjs.ext.dbseed development ~/Desktop/dev.dbseed-config.json
$ periodicjs createConfig app my-web-app development ~/Desktop/dev.application-config.json
---
$ periodicjs addConfig path/to/some/file.json
$ periodicjs addConfig ~/my-documents/my-app-config.json
---
$ periodicjs removeConfig [id-of-db-config]
$ periodicjs removeConfig 5914a3711a04c73349623be5
```
**[type]**
 * app | application
 * extension | ext
 * extension-local | ext-local
 * container | con
 * container-local | con-local

### Command Line Interface / Interactive Shell

```console
$ periodicjs repl
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --repl 
```


NEXT: [ How Periodic works ](https://github.com/typesettin/periodicjs/blob/master/doc/README.md)



![Periodic](https://raw.githubusercontent.com/typesettin/periodicjs/master/doc/images/white_logo_color_background.png)


## Building scalable enterprise applications

Periodic provides:
*	A simple way to create a dynamic web application or app with well-structured routes, templates and models
*	A beautiful React-based Isomorphic Admin UI based on database models
*	Entreprise Security & Authentication with extensions for hosting an OAuth2 Servers, Multi-factor authentication, integrations with several session stores and authentication mechanisms 
* Support for multiple protocols, websockets, REST, RPC and more
*	Scaffolding for web integrations, ERP, ECM, CMS applications and more


### Community

We have a friendly, growing community and welcome everyone to get involved.

Here are some ways:

* Follow [@PeriodicJS](https://twitter.com/PeriodicJS) on twitter for news and announcements
* Chat with us [on slack](https://periodic.typeform.com/to/SDldSv) (https://periodicjs.slack.com)
* Ask technical questions on [Stack Overflow](http://stackoverflow.com/questions/tagged/periodic.js) and tag them `periodicjs`
* Report bugs and issues on our [issue tracker](https://github.com/periodicjs/periodic/issues)
* ... or preferably, submit pull request with patches and / or new features


### Contributing

If you can, please contribute by reporting issues, discussing ideas, or submitting pull requests with patches and new features. We do our best to respond to all issues and pull requests within a day or two, and make patch releases to npm regularly.

<!--
If you're going to contribute code, please follow our [coding standards](https://github.com/periodicjs/periodic/wiki/Coding-Standards) and read our [CONTRIBUTING.md](https://github.com/periodicjs/periodic/blob/master/CONTRIBUTING.md).
## Usage

**Check out the [PeriodicJS Getting Started Guide](http://periodicjs.com/getting-started) to start using PeriodicJS.**

### Installation

Coming Soon

```bash
$ Coming Soon
```
Coming Soon
### Configuration

Config variables can be passed in an object to the `periodic.init` method, or can be set any time before `periodic.start` is called using `periodic.set(key, value)`. This allows for a more flexible order of execution (e.g. if you refer to Lists in your routes, you can set the routes after configuring your Lists, as in the example above).

See the [PeriodicJS configuration documentation](http://periodicjs.com/docs/configuration) for details and examples of the available configuration options.


#### Testing
To run the test suite run `npm test`.
-->

### Thanks

PeriodicJS is a free and open source community-driven project. Thanks to our many  [contributors](https://github.com/periodicjs/periodic/graphs/contributors) and  [users](https://github.com/periodicjs/periodic/stargazers) for making it great.

Periodic's development is led by [Yaw Etse](https://github.com/yawetse), [Jan Bialostok](https://github.com/janbialostok) and [Alan Garcia](https://github.com/alangalan).


## License

(The MIT License)

Copyright (c) 2017 Typesettin

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
