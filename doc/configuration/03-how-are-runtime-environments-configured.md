# How are runtime environments configured?

In order to run your application, a runtime environment must be configured.

## Runtime environment command line argument

Setting the runtime environment via a command line argument, or as an environment variable.

Periodic will prioritize command line arguments over environment variables 

```
$ node index.js development
```
```
$ node index.js -e development
```
```
$ node index.js --e=development
```
```
$ NODE_ENV=development node index.js
```
```
$ ENV=development node index.js
```

After you've specified a runtime environment via the command line, periodic will store the last runtime environment in your applications configuration db (in the file path `content/config/process/runtime.json`).

## (Advanced) Runtime environment database configuration record

You can add/update the database record in the configuration database for your saved runtime environment
```javascript
{
  "filepath" : "content/config/process/runtime.json",
  "config" : {
      "process" : {
          "runtime" : "development" //you can set the saved runtime environment
      }
  }
}
```

NEXT: [ Creating Configurations ](https://github.com/typesettin/periodicjs/blob/master/doc/configuration/04-creating-your-own-configurations.md)
