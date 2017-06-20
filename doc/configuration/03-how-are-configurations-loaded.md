# How are Extensions loaded?

During the periodic initialization process, your application will query the extension database and will retrieve a sorted list of extensions.

Extensions are sorted by the extension type and extension priority. 

Only valid extensions, and extensions who's dependencies are loaded, will be mounted on periodic's extension map (`periodic.extensions`).

```javascript
//During initialization, periodic's configuration LoadExtensions function, uses periodic's internal crud services to pull extensions in the correct order
periodic.crud.ext.list()
  .then(extensions=> checkExtensionDependencies)
  .catch(periodic.logger.error);

// the crud call queries the extension core data db for sorted extensions
periodic.datas.get('extension')
  .search({
    query: {},
    sort: {
      periodic_type: 1,
      periodic_priority: 1,
    },
  })
  .then(resolve)
  .catch(reject);

//checkExtensionDependencies will add an extension to the extension map if valid
periodic.extensions = new Map();

function checkExtensionDependencies(extension){
  if(semver.lt(periodic.settings.application.version,extension.periodic_compatibility) && // test to make sure if the extension is compatible with your version of periodic
  checkForRequiredExtensions(extension.periodic_dependencies)
  ){
    periodic.extensions.set(extension.name,extension);
  }
}
```

## periodicjs.ext.json

Each valid extension must contain an extension manifest json. This manifest defines an extension's type, priority, periodic compatibility, dependencies and shared configurations.

Sample `periodicjs.ext.json`
```javascript
{
  "periodic_compatibility": "10.0.0",
  "periodic_dependencies": [],
  "periodic_type": 7,
  "periodic_priority": 0,
  "periodic_config": {
  }
}
```

## Checking periodic compatibility (`"periodic_compatibility":"10.0.0"`)

An extension must declare which version of periodic it's compatibile with. If an extension is not compatible with your version of periodic, if you're are debugging output, a warning will be logged. Incompatible extension will not be loaded into the extension map `periodic.extensions`. 

## Checking extension dependencies

**periodic_dependencies** is an array of objects that define which extensions are required for the extension to work

```javascript
  "periodic_dependencies": [{
    "extname": "periodicjs.ext.mailer",
    "version": "~10.0.0",
    "optional":true,
  }, {
    "extname": "periodicjs.ext.login",
    "version": "~11.0.0"
  }, {
    "extname": "periodicjs.ext.uac",
    "version": "~7.0.0"
  }, {
    "extname": "periodicjs.ext.oauth2server",
    "version": "5.0.0"
  }],
```

* extname - the name of the required extension
* version - a valid semver of the extension node module
* optional - if the dependency is optional or not

## Extension Types (`"periodic_type"`)

Extension types are used to prioritize the order in which extension resources are mounted in periodic's express instance.

Because in express, the order in which middleware functions are pushed onto the stack, it's important to define the order.

Extension types must be a Number (either 0,1,2,3,4,5,6,7).

0. Core - these extensions typically overwrite the default periodic functionality (like how files are uploaded)
1. Communication - extensions that manipulation how information is sent (email, sms, etc)
2. Authorization - extensions that manage req.user 
3. User Access Control - manipulation of req.userprivileges
4. API - API Helpers 
5. Admin - Database administration extensions
6. Data - extensions that deal with data
7. UI - UI based extensions

## Extension Priorities (`"periodic_priority"`)

Extension Priorities are a way to prioritize how extensions of the same type should be loaded, for example if you're using two Authorization (`"periodic_type":2`) extension, one might have to be loaded before another.

A good example is a login extension and another login extension that extends the original login extension with two factor authentication

## Extension Shared Configs (`"periodic_config"`)

Extensions will export configurations so they will be mounted in the extension map, this is used to add additional views in an admin ui for example.

NEXT: [ Adding and Removing Configurations ](https://github.com/typesettin/periodicjs/blob/master/doc/configurations/04-adding-and-removing-configurations.md)