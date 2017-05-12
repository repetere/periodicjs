# Configuring Periodic

With Periodic 10, you can get up and running with periodic with zero configuration. To customize your Periodic application, you must define where configuration information sits. By default, Periodic uses Lowkie (an ORM for LokiJS).

The nice thing about Lowkie, is because it's JavaScript based, it can store data either in memory or to disk(via JSON DB interface).

The application configuration is defined in `[/path/to/app_root]/content/config/config.json`. Once loaded the application configuration sits on the `periodic.config` property 

## config.json

```javascript
//The default Periodic application configuration
{
  "configuration": {
    "type": "db",
    "db": "lowkie",
    "options": {
      "url": "content/config/settings/db.json"
    }
  },
  "settings":{
    "name":"My Application"
  }  
}
```

### config.json: configuration
The configuration property holds the information for you application's configuration database (can also be file based)
```javascript
configuration.type = "db" // can be either filebased or database driven "file" {db|file} 
configuration.db = "lowkie" // can be any valid core data orm adapter db {lowkie(loki)|mongoose(mongo)|sequelize(sql)|reddie(redis)}
configuration.options = {/**/} //core data apadter connection options
```
#### Example Loki Configuration
```json
{
  "configuration": {
    "type": "db",
    "db": "lowkie",
    "options": {
      "dbpath": "content/config/settings/config_db.json"
    }
  }
}
```
#### Example Mongo Configuration
```json
{
  "configuration": {
    "type": "db",
    "db": "mongoose",
    "options": {
      "url": "mongodb://localhost:27017/config_db",
      "connection_options":{}
    }
  }
}
```
#### Example SL Configuration
```json
{
  "configuration": {
    "type": "db",
    "db": "sequelize",
    "options": {
      "database": "testdb",
      "username": "",
      "password": "",
      "connection_options":{
        "dialect":"postgres",
        "port":5432,
        "host":"127.0.0.1"
      }
    }
  }
}
```
---
## Application Settings
The settings for Periodic are on the `periodic.settings` property. The applicatication settings are assigned by merging default settings, environment settings and override settings.

Default Settings -> Environment Settings -> Override Settings -> Application Settings

* **Environment settings** are set in the configuration database in the `content/config/environment/{name-of-environment}.json`
* **Override settings** are set on the _settings_ property in `content/config/config.json`

```javascript
//app settings demonstration
//in reality this happens during application start up, and is asynchronous (because configurations can be stored in files or databases)

//default settings (cannot be modified) - periodicjs/lib/defaults/environment.js
const defaultSettings = {
  name:'default app name',
  application:{
    environment:'demo',
    port:8786,
  },
  csrf: false,
  cluster_process: false,
  sessions:{
    enabled:false,
  },
}

//from configuration db - this.configuration.load({docid:'filepath',query:`content/config/environment/${this.config.process.runtime}.json`})
const environmentSettings = {
  application:{
    environment:'staging',
    port:8786,
  },
  sessions:{
    enabled:true,
    type:'redis',
  },
}

const overrideSettings = {
  name:'Accounting Pro',
  crsf: true,
  container: 'account_react_app@1.0.4',
  author: 'ACME Co',
}

periodic.settings = Object.assign({},defaultSettings,environmentSettings,overrideSettings);
/* if environment is staging
periodic.settings = {
  name:'Accounting Pro',
  application:{
    environment:'staging',
    port:8786,
  },
  sessions:{
    enabled:true,
    type:'redis',
  },
  crsf: true,
  container: 'account_react_app@1.0.4',
  author: 'ACME Co',
}
*/
```