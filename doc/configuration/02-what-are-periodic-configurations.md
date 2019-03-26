# What are Periodic Configurations?

Configurations are database records of settings for you application segreated by the runtime environment.

```javascript
//sample database configuration for the dbseed extension
{
  "filepath": "content/config/extensions/periodicjs.ext.dbseed/development.json",
  "environment": "development",
  "config": {
    "settings": {
      "export": {
        "ignore_core_datas": [
          "configuration",
          "extension"
        ],
        "split_count": 1000
      },
      "import": {
        "ignore_core_datas": [
          "configuration",
          "extension"
        ]
      }
    },
  }
}
```

Each database configuration record has three required properties (*filepath*,*environment*,*config*) and one optional property (*container*).

```javascript
{
  filepath, //the filepath is the unique field generated for each configuration, this field is automatically generated. 
  environment, // the runtime environment for the database configuration
  config, // the configuration information
  container,// optional - but if you want the configuration specific to a certain container
}
```

The configuration database has two Core Data models instantiated, the configuration model and the configuration model. The configuration Core Data model handles CRUD operations in the configuration database.

```javascript
const periodicjs = require('periodicjs');

periodicjs.dbs.get('configuration');// your connected configuration database
periodicjs.datas.get('configuration');// your configuration core data model (in the configuration database)
periodicjs.datas.get('configuration');// your configuration core data model (in the configuration database)
```

There are four different types of declarative Configurations:
1. Application Configurations
2. Extension Configurations
3. Container Configurations
4. Database Definition & Override Configurations


## 1. Application Configurations

Application configurations provide a mechanism to alter periodic's default functionality. 

The filepath for application configurations conform to the following pattern.
```javascript
const ApplicationConfigFilepath = `content/config/environment/${periodicjs.config.process.runtime}.json`;
//for example the configuration for your development environment would have the following filepath
const developmentEnvironmentFilepath = 'content/config/environment/development.json';
```

```javascript
//Sample Development configuration database record
{
  "filepath": "content/config/environment/development.json",
  "environment": "development",
  "config": {
    "name": "My Application",
    "application": {
      "environment": "development",
      "cluster_process": false,
      "exit_on_invalid_extensions": false,
      "check_for_updates": true,
      "version": "10.1.0",
      "server": {
        "http": {
          "port": 8786
        },
        "https": {
          "port": 8787,
          "ssl": {
            "private_key": "node_modules/periodicjs/lib/defaults/demo/certs/2017.testperiodic.ssl_key.pem",
            "certificate": "node_modules/periodicjs/lib/defaults/demo/certs/2017.testperiodic.ssl_cert.pem"
          }
        }
      }
    },
    "logger": {
      "use_winston_logger": true,
      "winston_exit_on_error": false,
      "use_standard_logging": true,
      "custom_logger_file_path": false,
      "custom_logger_node_modules": []
    },
    "express": {
      "config": {
        "trust_proxy": true,
        "use_static_caching": false,
        "use_compression": true,
        "debug": true,
        "csrf": true
      },
      "views": {
        "template_engine": "ejs",
        "lru_cache": true,
        "lru": 100,
        "engine": "ejs",
        "package": "ejs",
        "extension": "ejs",
        "page_data": {
          "title": "Web Application",
          "version": "10.1.0",
          "description": "App Description",
          "author": "acme co"
        }
      },
      "response_time": {
        "digits": 5
      },
      "use_flash": true,
      "body_parser": {
        "urlencoded": {
          "limit": "1mb",
          "extended": true
        },
        "json": {
          "limit": "1mb"
        }
      },
      "cookies": {
        "cookie_parser": "defaultcookiejson"
      },
      "sessions": {
        "enabled": true,
        "type": "loki",
        "config": {
          "proxy": true,
          "resave": false,
          "saveUninitialized": false,
          "secret": "defaultsessionsecret",
          "cookie": {
            "expires": 604800000,
            "maxAge": 604800000,
            "secure": "auto"
          }
        }
      },
      "routing": {
        "data": "/data",
        "extension": "/ext",
        "container": "/"
      }
    },
    "periodic": {
      "version": "10.1.0",
      "emails": {
        "server_from_address": "Local Perodic App <hello@localhost>",
        "notification_address": "Local Perodic App <hello@localhost>"
      }
    },
    "databases": {
      "standard": {
        "db": "lowkie",
        "options": {
          "dbpath": "content/config/settings/standard_db.json",
          "dboptions": {
            "verbose": true
          }
        },
        "controller": {
          "default": {
            "protocol": {
              "adapter": "http",
              "api": "rest"
            },
            "responder": {
              "adapter": "json"
            }
          }
        },
        "router": {
          "ignore_models": []
        }
      }
    },
    "extensions": {},
    "container": {}
  }
}
```

## 2. Extension Configurations

Extension configurations provide a mechanism to alter an Extensions's default functionality. 

The filepath for extension configurations conform to the following pattern.
```javascript
const ExtensionConfigFilepath = `content/config/extensions/${extension.name}/${periodicjs.config.process.runtime}.json`;
//for example the configuration for your development environment would have the following filepath
const developmentEnvironmentFilepath = 'content/config/extensions/periodicjs.ext.dbseed/development.json';
```

Extension configurations require two properties, a *settings* property and a *database* property. 

```javascript
//Sample Development configuration database record
{
  "filepath": "content/config/extensions/periodicjs.ext.dbseed/development.json",
  "environment": "development",
  "config": {
    "settings": {
      "defaults": true,
      "export": {
        "ignore_core_datas": [
          "configuration",
          "extension"
        ],
        "split_count": 1000
      },
      "import": {
        "ignore_core_datas": [
          "configuration",
          "extension"
        ]
      }
    },
    "databases": {}
  }
}
```

## 3. Container Configurations

Container configurations provide a mechanism to alter a Container's default functionality. 

The filepath for container configurations conform to the following pattern.
```javascript
const ContainerConfigFilepath = `content/config/container/${container.name}/${periodicjs.config.process.runtime}.json`;
//for example the configuration for your development environment would have the following filepath
const developmentEnvironmentFilepath = 'content/config/container/periodicjs.ext.dbseed/development.json';
```

Container configurations also require two properties, a *settings* property and a *database* property. 

```javascript
//Sample Development configuration database record
{
  "filepath": "content/config/container/my-shopping-site /development.json",
  "environment": "development",
  "config": {
    "settings": {
      "defaults": true,
      "export": {
        "ignore_core_datas": [
          "configuration",
          "extension"
        ],
        "split_count": 1000
      },
      "import": {
        "ignore_core_datas": [
          "configuration",
          "extension"
        ]
      }
    },
    "databases": {}
  }
}
```

## 4. Database Definition & Override Configurations

In order to customize your application, you must define the connection details to your configuration database. Your definition file must either be a json file, a javascript object, or an asychronous javascript function that resolves an object with connection details. 


### Database Definition

This gives you an extreme amount of flexility on where/how to store credentials. The definition file is either `app_root/content/config/config.json` or `app_root/content/config/config.js`

```javascript
//simple json file example - [app_root]/content/config/config.json
{
  "configuration": {
    "type": "db",
    "db": "lowkie",
    "options": {
      "dbpath": "content/config/settings/config_db.json",
    },
  },
  "settings":{
    "name":"My Application"
  }
}
//simple javascript file - [app_root]/content/config/config.js
module.exports = {
  configuration: {
    type: 'db',
    db: 'mongoose',
    options: {
      url: process.env.CONFIG_DB_CONNETION_URL,// 'mongodb://localhost:27017/config_db',
      connection_options: {},
    },
  },
  settings:{
    name:'My Application'
  }  
};
//advanced asynchronous javascript function
module.exports = () => {
  return new Promise ((resolve,reject)=>{
    try{
      someAsyncResource()
        .then(connectionSettings=>{
          resolve({
            configuration: {
              type: 'db',
              db: 'sequelize',
              options: {
                database: 'configdb',
                username: connectionSettings.username,
                password: connectionSettings.password,
                connection_options: {
                  dialect: 'postgres',
                  port: 5432,
                  host: '127.0.0.1',
                },
              },
            },
            settings:{
              name:'My Application'
            } 
          });
        })
        .catch(reject)
    } catch(e){
      reject(e);
    }
  });
};

//The configuration property holds the information for you application's configuration database (can also be file based)
configuration.type = "db" // can be either filebased or database driven "file" {db|file} 
configuration.db = "lowkie" // can be any valid core data orm adapter db {lowkie(loki)|mongoose(mongo)|sequelize(sql)|reddie(redis)}
configuration.options = {/**/} //core data apadter connection options
```

### Override Configurations

In the same configuration file; either `app_root/content/config/config.json` or `app_root/content/config/config.js`, you can define override configurations on the settings property.

All settings for Periodic are on the `periodic.settings` property. The application settings are assigned by merging default settings, environment settings and override settings.

Default Settings -> Environment Settings -> Override Settings -> Application Settings

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

NEXT: [ How are runtime environments configured? ](https://github.com/repetere/periodicjs/blob/master/doc/configuration/03-how-are-runtime-environments-configured.md)
