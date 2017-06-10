#Index

**Modules**

* [cli](#module_cli)
  * [cli.appconfig](#module_cli#appconfig)
  * [cli.db](#module_cli#db)
  * [cli.mongoose](#module_cli#mongoose)
  * [cli.logger](#module_cli#logger)
  * [cli~models](#module_cli..models)
  * [cli.periodicResources](#module_cli#periodicResources)
* [config](#module_config)
  * [config.setConfig](#module_config#setConfig)
  * [config.setSetting](#module_config#setSetting)
  * [config.init](#module_config#init)
  * [config~packagejsonFileJSON](#module_config..packagejsonFileJSON)
  * [config~configurationOverrideFileJSON](#module_config..configurationOverrideFileJSON)
  * [config~configurationDefaultFile](#module_config..configurationDefaultFile)
  * [config~configurationFile](#module_config..configurationFile)
  * [config~config](#module_config..config)
  * [config.settings()](#module_config#settings)
  * [config.getConfigFilePath()](#module_config#getConfigFilePath)
* [periodic](#module_periodic)
* [periodic.periodic/init](#periodic.module_periodic/init)
  * [periodic/init.appconfig](#periodic.module_periodic/init#appconfig)
  * [periodic/init.db](#periodic.module_periodic/init#db)
  * [periodic/init.dburl](#periodic.module_periodic/init#dburl)
  * [periodic/init.mngse](#periodic.module_periodic/init#mngse)
  * [periodic/init.logger](#periodic.module_periodic/init#logger)
  * [periodic/init.loadConfiguration()](#periodic.module_periodic/init.loadConfiguration)
  * [periodic/init.useLogger()](#periodic.module_periodic/init.useLogger)
  * [periodic/init.viewSettings()](#periodic.module_periodic/init.viewSettings)
  * [periodic/init.expressSettings()](#periodic.module_periodic/init.expressSettings)
  * [periodic/init.staticCaching()](#periodic.module_periodic/init.staticCaching)
    * [staticCaching~expressStaticOptions](#periodic.module_periodic/init.staticCaching..expressStaticOptions)
  * [periodic/init.pageCompression()](#periodic.module_periodic/init.pageCompression)
  * [periodic/init.appLogging()](#periodic.module_periodic/init.appLogging)
  * [periodic/init.useSessions()](#periodic.module_periodic/init.useSessions)
  * [periodic/init.useLocals()](#periodic.module_periodic/init.useLocals)
  * [periodic/init.applicationRouting()](#periodic.module_periodic/init.applicationRouting)
    * [applicationRouting~periodicObj](#periodic.module_periodic/init.applicationRouting..periodicObj)
  * [periodic/init.serverStatus()](#periodic.module_periodic/init.serverStatus)
  * [periodic/init.catchErrors()](#periodic.module_periodic/init.catchErrors)
* [staticViewHelper](#module_staticViewHelper)
* [staticViewHelper.staticViewHelper/viewhelper](#staticViewHelper.module_staticViewHelper/viewhelper)
  * [staticViewHelper/viewhelper.includeJavaScripts(scripts)](#staticViewHelper.module_staticViewHelper/viewhelper.includeJavaScripts)
  * [staticViewHelper/viewhelper.passObjToClient(obj, nameOfClientObj)](#staticViewHelper.module_staticViewHelper/viewhelper.passObjToClient)
  * [staticViewHelper/viewhelper.getPaginationHtml(options)](#staticViewHelper.module_staticViewHelper/viewhelper.getPaginationHtml)
* [staticViewHelper.staticViewHelper/themehelper](#staticViewHelper.module_staticViewHelper/themehelper)
  * [staticViewHelper/themehelper.extensionPublicResourcePath(ext, resource)](#staticViewHelper.module_staticViewHelper/themehelper.extensionPublicResourcePath)
  * [staticViewHelper/themehelper.themePublicResourcePath(ext, resource)](#staticViewHelper.module_staticViewHelper/themehelper.themePublicResourcePath)
* [themes](#module_themes)
* [routes](#module_routes)
  * [routes~homeController](#module_routes..homeController)
 
<a name="module_cli"></a>
#cli
A simple node script for running Command Line Argument based tasks from periodic controllers and extensions

**Params**

- argv `object` - command line arguments from optimist  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
**Members**

* [cli](#module_cli)
  * [cli.appconfig](#module_cli#appconfig)
  * [cli.db](#module_cli#db)
  * [cli.mongoose](#module_cli#mongoose)
  * [cli.logger](#module_cli#logger)
  * [cli~models](#module_cli..models)
  * [cli.periodicResources](#module_cli#periodicResources)

<a name="module_cli#appconfig"></a>
##cli.appconfig
creates instance of configuration object

<a name="module_cli#db"></a>
##cli.db
environment based database configuration

<a name="module_cli#mongoose"></a>
##cli.mongoose
instance of mongoose connection based on configuration settings in content/config/database.js

<a name="module_cli#logger"></a>
##cli.logger
winston logger instance based on  configuration settings in content/config/logger.js

<a name="module_cli..models"></a>
##cli~models
load mongoose models

**Params**

- periodic `object` - the same instance configuration object  

**Scope**: inner member of [cli](#module_cli)  
<a name="module_cli#periodicResources"></a>
##cli.periodicResources
application reference passed to controllers

<a name="module_config"></a>
#config
A module that loads configurations for express and periodic.

**Type**: `Error`  
**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
**Members**

* [config](#module_config)
  * [config.setConfig](#module_config#setConfig)
  * [config.setSetting](#module_config#setSetting)
  * [config.init](#module_config#init)
  * [config~packagejsonFileJSON](#module_config..packagejsonFileJSON)
  * [config~configurationOverrideFileJSON](#module_config..configurationOverrideFileJSON)
  * [config~configurationDefaultFile](#module_config..configurationDefaultFile)
  * [config~configurationFile](#module_config..configurationFile)
  * [config~config](#module_config..config)
  * [config.settings()](#module_config#settings)
  * [config.getConfigFilePath()](#module_config#getConfigFilePath)

<a name="module_config#setConfig"></a>
##config.setConfig
augments the configuration information

**Params**

- name `string` - name of new configuration setting  
- value `value` - value of new configuration setting  

**Extends**: `object`  
<a name="module_config#setSetting"></a>
##config.setSetting
augments the configuration information

**Params**

- name `string` - name of new configuration setting  
- value `value` - value of new configuration setting  

**Extends**: `object`  
<a name="module_config#init"></a>
##config.init
loads app configuration

**Type**: `Error`  
<a name="module_config..packagejsonFileJSON"></a>
##config~packagejsonFileJSON
get info from package.json

**Scope**: inner member of [config](#module_config)  
<a name="module_config..configurationOverrideFileJSON"></a>
##config~configurationOverrideFileJSON
load user config file: content/config/config.json

**Scope**: inner member of [config](#module_config)  
<a name="module_config..configurationDefaultFile"></a>
##config~configurationDefaultFile
set path of default config: content/config/environment/default.json

**Scope**: inner member of [config](#module_config)  
<a name="module_config..configurationFile"></a>
##config~configurationFile
set & load file path for base environment config

**Scope**: inner member of [config](#module_config)  
<a name="module_config..config"></a>
##config~config
override environment data with user config

**Scope**: inner member of [config](#module_config)  
<a name="module_config#settings"></a>
##config.settings()
gets the configuration information

**Returns**: `object` - current instance configuration  
<a name="module_config#getConfigFilePath"></a>
##config.getConfigFilePath()
generate file path for config files

**Returns**: `string` - file path for config file  
<a name="module_periodic"></a>
#periodic
A module that represents a periodic app.

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="periodic.module_periodic/init"></a>
#periodic.periodic/init
initializes periodic express configuration options

**Members**

* [periodic.periodic/init](#periodic.module_periodic/init)
  * [periodic/init.appconfig](#periodic.module_periodic/init#appconfig)
  * [periodic/init.db](#periodic.module_periodic/init#db)
  * [periodic/init.dburl](#periodic.module_periodic/init#dburl)
  * [periodic/init.mngse](#periodic.module_periodic/init#mngse)
  * [periodic/init.logger](#periodic.module_periodic/init#logger)
  * [periodic/init.loadConfiguration()](#periodic.module_periodic/init.loadConfiguration)
  * [periodic/init.useLogger()](#periodic.module_periodic/init.useLogger)
  * [periodic/init.viewSettings()](#periodic.module_periodic/init.viewSettings)
  * [periodic/init.expressSettings()](#periodic.module_periodic/init.expressSettings)
  * [periodic/init.staticCaching()](#periodic.module_periodic/init.staticCaching)
    * [staticCaching~expressStaticOptions](#periodic.module_periodic/init.staticCaching..expressStaticOptions)
  * [periodic/init.pageCompression()](#periodic.module_periodic/init.pageCompression)
  * [periodic/init.appLogging()](#periodic.module_periodic/init.appLogging)
  * [periodic/init.useSessions()](#periodic.module_periodic/init.useSessions)
  * [periodic/init.useLocals()](#periodic.module_periodic/init.useLocals)
  * [periodic/init.applicationRouting()](#periodic.module_periodic/init.applicationRouting)
    * [applicationRouting~periodicObj](#periodic.module_periodic/init.applicationRouting..periodicObj)
  * [periodic/init.serverStatus()](#periodic.module_periodic/init.serverStatus)
  * [periodic/init.catchErrors()](#periodic.module_periodic/init.catchErrors)

<a name="periodic.module_periodic/init#appconfig"></a>
##periodic/init.appconfig
creates instance of configuration object

<a name="periodic.module_periodic/init#db"></a>
##periodic/init.db
environment based database configuration

<a name="periodic.module_periodic/init#dburl"></a>
##periodic/init.dburl
shortcut to db url in content/config/database.js

<a name="periodic.module_periodic/init#mngse"></a>
##periodic/init.mngse
instance of mongoose connection based on configuration settings in content/config/database.js

<a name="periodic.module_periodic/init#logger"></a>
##periodic/init.logger
winston logger instance based on  configuration settings in content/config/logger.js

<a name="periodic.module_periodic/init.loadConfiguration"></a>
##periodic/init.loadConfiguration()
loads the periodic configuration options

<a name="periodic.module_periodic/init.useLogger"></a>
##periodic/init.useLogger()
loads application logger configuration

<a name="periodic.module_periodic/init.viewSettings"></a>
##periodic/init.viewSettings()
configure express view rendering options

<a name="periodic.module_periodic/init.expressSettings"></a>
##periodic/init.expressSettings()
sets up standard express settings

<a name="periodic.module_periodic/init.staticCaching"></a>
##periodic/init.staticCaching()
set reponse cache settings for static assets, in dev mode disable caching

<a name="periodic.module_periodic/init.pageCompression"></a>
##periodic/init.pageCompression()
use gzip compression if enabled in configuration options

<a name="periodic.module_periodic/init.appLogging"></a>
##periodic/init.appLogging()
set application logging options

<a name="periodic.module_periodic/init.useSessions"></a>
##periodic/init.useSessions()
set up express application session configuration

<a name="periodic.module_periodic/init.useLocals"></a>
##periodic/init.useLocals()
template rendering helper functions and objects

<a name="periodic.module_periodic/init.applicationRouting"></a>
##periodic/init.applicationRouting()
application routing options

<a name="periodic.module_periodic/init.serverStatus"></a>
##periodic/init.serverStatus()
application server status

<a name="periodic.module_periodic/init.catchErrors"></a>
##periodic/init.catchErrors()
exception catching settings

<a name="module_staticViewHelper"></a>
#staticViewHelper
A module that contains view helpers for ejs views.

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="staticViewHelper.module_staticViewHelper/viewhelper"></a>
#staticViewHelper.staticViewHelper/viewhelper
ejs view helper

**Members**

* [staticViewHelper.staticViewHelper/viewhelper](#staticViewHelper.module_staticViewHelper/viewhelper)
  * [staticViewHelper/viewhelper.includeJavaScripts(scripts)](#staticViewHelper.module_staticViewHelper/viewhelper.includeJavaScripts)
  * [staticViewHelper/viewhelper.passObjToClient(obj, nameOfClientObj)](#staticViewHelper.module_staticViewHelper/viewhelper.passObjToClient)
  * [staticViewHelper/viewhelper.getPaginationHtml(options)](#staticViewHelper.module_staticViewHelper/viewhelper.getPaginationHtml)

<a name="staticViewHelper.module_staticViewHelper/viewhelper.includeJavaScripts"></a>
##staticViewHelper/viewhelper.includeJavaScripts(scripts)
helper function that returns the html for a javascript tag

**Params**

- scripts `object` - either a string or an object/array of file paths  

**Returns**: `string` - script tag for javascript  
<a name="staticViewHelper.module_staticViewHelper/viewhelper.passObjToClient"></a>
##staticViewHelper/viewhelper.passObjToClient(obj, nameOfClientObj)
helper function exposes a server javascript object to the client

**Params**

- obj `object` - server object for the client  
- nameOfClientObj `object` - name of exposed server object for the client  

**Returns**: `string` - javascript statement that contains server javascript object  
<a name="staticViewHelper.module_staticViewHelper/viewhelper.getPaginationHtml"></a>
##staticViewHelper/viewhelper.getPaginationHtml(options)
helper function that generates html for pagination

**Params**

- options `object` - view options  

**Returns**: `string` - html for pagination  
<a name="staticViewHelper.module_staticViewHelper/themehelper"></a>
#staticViewHelper.staticViewHelper/themehelper
theme file path view helpers for ejs

**Members**

* [staticViewHelper.staticViewHelper/themehelper](#staticViewHelper.module_staticViewHelper/themehelper)
  * [staticViewHelper/themehelper.extensionPublicResourcePath(ext, resource)](#staticViewHelper.module_staticViewHelper/themehelper.extensionPublicResourcePath)
  * [staticViewHelper/themehelper.themePublicResourcePath(ext, resource)](#staticViewHelper.module_staticViewHelper/themehelper.themePublicResourcePath)

<a name="staticViewHelper.module_staticViewHelper/themehelper.extensionPublicResourcePath"></a>
##staticViewHelper/themehelper.extensionPublicResourcePath(ext, resource)
helper function to get file paths for extension resources

**Params**

- ext `object` - name of periodic extension  
- resource `object` - file path of extension resource  

**Returns**: `string` - file path for extension resource  
<a name="staticViewHelper.module_staticViewHelper/themehelper.themePublicResourcePath"></a>
##staticViewHelper/themehelper.themePublicResourcePath(ext, resource)
helper function to get file paths for theme resources

**Params**

- ext `object` - name of periodic theme  
- resource `object` - file path of theme resource  

**Returns**: `string` - file path for theme resource  
<a name="module_themes"></a>
#themes
A module that represents a theme manager.

**Params**

- appsettings `object` - reference to periodic instance  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_routes"></a>
#routes
The module that manages the express router for periodic, routes from extensions are loaded first, and then are overwritable from theme routes.

**Params**

- periodic `object` - this is the object passed from lib/periodic.js, it contains the expressjs instance, connection to mongo and others (express,app,logger,settings,db,mongoose)  

**Author**: Yaw Joseph Etse  
**License**: MIT  
**Copyright**: Copyright (c) 2014 Typesettin. All rights reserved.  
<a name="module_routes..homeController"></a>
##routes~homeController
controller for homepage

**Scope**: inner member of [routes](#module_routes)  
**Type**: `function`  
