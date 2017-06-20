# Customizing Your Application 

Periodic applications are comprised of four component features that can be customized:

1. Your Application
2. Your Extensions
3. Your Contianer
4. Your Front-end (if applicable)

## 1. Your Application
Periodic applications are configured per runtime environment, this means for example in a development environment you could use a disk based/or memory based configuration with Lowkie, in QA and Staging you could use a document based configuration with Mongo or Redis, and in Production you could use a SQL based configuration.

Configurations and Database connections are all instances of Core Data. Core Data allows you to have a heterogenious mix of resources from different databases (You could have your user, order, and transaction data in SQL, and your product catelog in Mongo).

The general configuration flow is to:
1. Define where your configuration database
2. Create environment specific configuration json documents for your application and extensions
3. Add the configurations to your application's configuration database

## 2. Your Extensions

Another way to customize your application is to extend the API/web application capability by adding extensions. Extensions are node modules that inject functionality into your application in predictable way (For example there are CMS extensions for building a bespoke Node-based CRM, there's a graph server extension to add GraphQL functionality to your application).

You can read more about Extensions [ here ](https://github.com/typesettin/periodicjs/blob/master/doc/extensions/01-overview.md).

## 3. Your Containers

Containers are typically where if your application has a front end component, the logic for your application front end resides. 

Functionally Containers are identical to Extensions, however, periodic will prioritize Routes and Views from a Container first.

The prioritization of how resources are loaded are a result of how resources are mounted on the instance of Express that periodic exposes. Since Express routes match regexes in the order in which they are mounted on a router, your application will match Container routers, before Extension routes, and will finally match core data routes (if they exist).

You can read more about Containers [here](https://github.com/typesettin/periodicjs/blob/master/doc/containers/01-overview.md).

## 4. Your Front-end

Views are also loaded with the same level of customization and priority of resource loading. Any view can ultimately be overwritten at the container level, provided that the express middleware controller function utilizes periodic's core controller module's `renderView method`

```javascript
const periodic = require('periodicjs');

function someMiddleWareFunction(req, res){
  const viewtemplate = 'user/profile';
  const viewdata = req.user.profile;
  periodic.core.controller.renderView(req, res, viewtemplate, viewdata);
}
```

**`renderView`** will attempt to prioritize loading the appropriate  view if the file exists.

1. `user/profile` in your container module `app_root/content/container/[name-of-container]/views/user/profile(.ejs/.jsx/.hbl - the extension is based on your application configuration)
2. `user/profile` in an extension, if the route was mounted on your express application and the file does not exist in your Container `app_root/node_modules/[name-of-extension]/views/user/profile[.your-configured-view-engine-extension]` 
3. `user/profile` in your application's default view directory `app_root/views/user/profile[.ext]`

All Configurations settings are merged from a set of default configurations, environment specific configurations and finally override configurations.

NEXT: [ Configuration ](https://github.com/typesettin/periodicjs/blob/master/doc/configuration/01-overview.md) 