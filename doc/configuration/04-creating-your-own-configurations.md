# Creating configurations - `$ periodicjs createConfig [type] [name] [environment] [filepath]` 

You can use the periodic CLI to create the scaffolding for a new configuration. 

**[type]**
 * app | application
 * extension | ext
 * extension-local | ext-local
 * container | con
 * container-local | con-local

**[name]**
 * the name of your application, extension or container

**[environment]**
 * the name of your runtime environment (development|staging|qa|production|etc)

**[filepath]**
 * the filepath of the your scaffolded configuration file


Example (creating an extension configuration):
```console
$ cd /var/www/webapp
$ periodicjs createConfig ext periodicjs.ext.dbseed development ~/Desktop/dev.dbseed-config.json
```
```javascript
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


Example (creating an application configuration):
```console
$ cd /var/www/webapp
$ periodicjs createConfig app my-web-app development ~/Desktop/dev.application-config.json
```
```javascript
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
          "description": "Periodic is an enterprise information and content management system, designed to quickly implement your own information architecture. Periodic defines a lightweight application wrapper for Express, that provides a simple mechanism to handle theming, routes and extensions. Unlike some traditional content management solutions, there are no assumptions made about your data model, which allows for information hierarchies and taxonomies to be extremely malleable.",
          "keywords": "content management framework, typeset, wysiwyg, ui manager, CMS, CDS, Express, ExpressJS, Application Framework, Micro Framework, Node CMS, wordpress, drupal, modular,Content Delivery System, Content Management System, Periodic Decoupled Framework",
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
        "server_from_address": "Local Perodic App ",
        "notification_address": "Local Perodic App "
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

NEXT: [ Adding and Removing Configurations ](https://github.com/typesettin/periodicjs/blob/master/doc/configurations/05-adding-and-removing-configurations.md)