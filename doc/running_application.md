# Running Periodic

After creating a basic application script (read more about configuration), run your application from your application root directory by specifying a runtime environment.

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