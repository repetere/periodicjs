# Adding configurations - `$ periodicjs addConfig path/to/some/file.json` 

You can add configurations to your database manually or you can use the Periodic CLI to add configurations.

```console
$ cd path/to/app_root
$ periodicjs addConfig [path/to/some/file.json]
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --crud=config --crud_op=create --crud_arg=[path/to/some/file.json] 
```

Behind the scenes, the CLI uses periodic's internal crud methods to add a new database record via Core Data
```javascript
const configurationDB = periodic.datas.get('configuration'); //Core Data DB

function create(filepath){
  const createdat = Date.now();
  const updatedat = Date.now();
  return new Promise((resolve,reject)=>{
    fs.readJSON(path.resolve(filepath))
      .then(configJSON => {
        resolve(configurationDB.create({
          newdoc: Object.assign({},
            configJSON, {
              createdat,
              updatedat,
            }),
        }));
      })
      .catch(reject);
  });
}
```

Example:
```console
$ cd /var/www/webapp
$ periodicjs addConfig ~/my-documents/my-app-config.json
```

# Removing configurations - `$ periodicjs removeConfig [id-of-db-config]` 

To remove a configuration from the configuration db, you must specify the database record id.

```console
$ cd path/to/app_root
$ periodicjs removeConfig [id-of-db-config]
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --crud=ext --crud_op=remove --crud_arg=[id-of-db-config] 
```

Example:
```console
$ cd /var/www/webapp
$ periodicjs removeConfig 5914a3711a04c73349623be5
```

NEXT: [ Extensions ](https://github.com/typesettin/periodicjs/blob/master/doc/extensions/01-overview.md) 