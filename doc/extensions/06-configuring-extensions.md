# Creating configurations - `$ periodicjs createConfig extension [name] [environment] [filepath]` 

You can use the periodic CLI to create the scaffolding for a new configuration. 

Example (creating an extension configuration):
```console
$ cd /var/www/webapp
$ periodicjs createConfig ext periodicjs.ext.dbseed development ~/Desktop/dev.dbseed-config.json
```

### Adding configurations - `$ periodicjs addConfig path/to/some/file.json` 

You can add configurations to your database manually or you can use the Periodic CLI to add configurations.
```console
$ cd path/to/app_root
$ periodicjs addConfig ~/Desktop/dev.dbseed-config.json
```

### Removing configurations - `$ periodicjs removeConfig [id-of-db-config]` 

To remove a configuration from the configuration db, you must specify the database record id.

```console
$ cd path/to/app_root
$ periodicjs removeConfig [id-of-db-config]
$ periodicjs removeConfig 5914a3711a04c73349623be5
```

NEXT: [ Creating Extensions ](https://github.com/typesettin/periodicjs/blob/master/doc/extensions/07-creating-your-own-extensions.md)
