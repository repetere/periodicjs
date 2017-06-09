# Running Periodic

After creating a basic application script (read more about configuration), run your application from your application root directory by specifying a runtime environment.

* Overview
* Recommended Settings
* Command Line Interface
* REPL
___
## Overview
```javascript
//example ES6
import periodic from 'periodic'; //periodic singleton
//example index.js - ES5
'use strict';
const periodic = require('periodicjs'); //periodic singleton
periodic.init()
  .then(console.log.bind(console)) //log startup status
  .catch(console.error.bind(console)) //log any errors
```

Now run your application by specifying runtime environment as a command line argument
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

After you've specified a runtime environment via the command line, periodic will store the last runtime environment in your applications configuration db (in the file path `content/config/process/runtime.json`).

---
## (Recommended) Settings
It's recommended that you run your application with a node process manager (PM2, Nodemon, forever, etc).

Sample Project package json
```json
{
  "name": "my-app-server",
  "description": "Simple app server.",
  "version": "0.0.1",
  "main": "index.js",
  "engines": {
    "node": "^6.x"
  },
  "scripts": {
    "start": "nodemon index.js --e",
    "test": "mocha -R spec --recursive"
  },
  "dependencies": {
    "periodicjs": "^10.0.0"
  }
}

```

And then just run your application via npm
```
$ npm start development
```
---
## Command Line Interface
Use the `--cli` command line argument to interact with periodic's command line interface. For example to add a configuration via the command line:
```
$ node index.js development --cli --crud=config --crud_op=create --crud_arg=node_modules/periodicjs/lib/defaults/demo/configs/testconfig.json --debug

017-05-18T16:17:00.540Z - info: Leave Promise Chain: CLI Process
2017-05-18T16:17:00.584Z - info: CLI crud:config op:create, successful.
2017-05-18T16:17:00.585Z - debug: CLI crud arguments arg: node_modules/periodicjs/lib/defaults/demo/configs/testconfig.json
2017-05-18T16:17:00.585Z - debug: CLI crud process result: 
{ '$__': 
  errors: undefined,
  _doc: 
   { container: 'periodicjs.container.default',
     createdat: 2017-05-18T16:17:00.539Z,
     updatedat: 2017-05-18T16:17:00.539Z,
     config: { some: 'data', test: true },
     environment: 'test',
     filepath: 'content/config/appconfig/myconfig.json',
     __v: 0 } }
```
The CRUD CLI has the following options
* crud - crud type (entity type: config, ext, con)
* crud_op - crud operation (create,remove,update,get,list)
* crud_arg - crud argument (argument for crud operation)

Read the full CLI documentation here

---
## Periodic REPL
Periodic has a built in REPL that has the entire context of your periodic application available on `$p`.
```
$ node index.js development --cli --repl
2017-05-18T16:22:55.204Z - debug: Running in environment: development
$p > 2017-05-18T16:22:55.235Z - info: Leave Promise Chain: CLI Process
2017-05-18T16:22:55.365Z - debug: Your version of Periodic[10.0.0] is up to date with the current version [9.2.0]
```
press enter after periodic is fully loaded
```
$p > $p.config
{ debug: true,
  app_root: '/Users/yawetse/Developer/github/test/testperiodic',
  configuration: 
   { type: 'db',
     db: 'mongoose',
     options: 
      { url: 'mongodb://localhost:27017/config_db',
        connection_options: {} } },
  time_start: 1495124575079,
  process: 
   { runtime: 'development',
     cli: true,
     argv: { _: [Object], cli: true, repl: true } } }
```
You can access anything on a fully instantiated periodic application, like the current environment
```
$p > $p.environment
'development'
```
Also querying mounted core data objects
```
$p > $p.datas.get('configuration').load({docid:'filepath', query:'content/config/process/runtime.json'}).then(result => {console.log(result)}).catch(e=>console.error)
Promisie {
  <pending>,
  try: [Function: _try],
  spread: [Function: _spread],
  map: [Function: _map],
  each: [Function: _each],
  settle: [Function: _settle],
  retry: [Function: _retry],
  finally: [Function: _finally] }
$p > { _id: 5914a3711a04c73349623be5,
  filepath: 'content/config/process/runtime.json',
  config: { process: { runtime: 'development' } },
  __v: 0,
  updatedat: 2017-05-11T17:46:25.429Z,
  createdat: 2017-05-11T17:46:25.429Z,
  container: 'periodicjs.container.default' }
```