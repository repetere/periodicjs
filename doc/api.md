## Modules

<dl>
<dt><a href="#module_periodic">periodic</a></dt>
<dd><p>Periodic is an application framework for building enterprise javascript applications.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#configureLowkie">configureLowkie()</a> ⇒ <code>Promise</code></dt>
<dd><p>configureLowkie creates a loki connection to store DB based configurations</p>
</dd>
<dt><a href="#configureMongoose">configureMongoose()</a> ⇒ <code>Promise</code></dt>
<dd><p>configureMongoose creates a mongo connection to store DB based configurations</p>
</dd>
<dt><a href="#configureSequelize">configureSequelize()</a> ⇒ <code>Promise</code></dt>
<dd><p>configureSequelize creates a mongo connection to store DB based configurations</p>
</dd>
<dt><a href="#loadConfiguration">loadConfiguration()</a> ⇒</dt>
<dd><p>reads content/config/(config.json||config.js) for  the configuration database</p>
</dd>
<dt><a href="#startTimer">startTimer()</a> ⇒</dt>
<dd><p>Starts intialization console timer</p>
</dd>
<dt><a href="#endTimer">endTimer()</a> ⇒</dt>
<dd><p>Ends initialization console timer</p>
</dd>
<dt><a href="#configureViews">configureViews()</a> ⇒ <code>Promise</code></dt>
<dd><p>configure express view rendering options</p>
</dd>
<dt><a href="#initializeExpress">initializeExpress()</a> ⇒ <code>Promise</code></dt>
<dd><p>sets the runtime environment correctly</p>
</dd>
<dt><a href="#setUpFolderStructure">setUpFolderStructure()</a> ⇒</dt>
<dd><p>this will setup a periodic application folder structure if one doesnt exist, it will not overwrite existing configs</p>
</dd>
<dt><a href="#configureLogger">configureLogger()</a> ⇒ <code>Promise</code></dt>
<dd><p>configures winston</p>
</dd>
<dt><a href="#getEnv">getEnv(argv)</a> ⇒ <code>string</code> | <code>boolean</code></dt>
<dd><p>get the application environment from command line arguments</p>
</dd>
<dt><a href="#setAppRunningEnv">setAppRunningEnv(env, operation, processRuntimeConfig)</a> ⇒ <code>boolean</code> | <code>Promise</code></dt>
<dd><p>sets the application runtime environment and save last run environment into configuration</p>
</dd>
<dt><a href="#configRuntimeEnvironment">configRuntimeEnvironment()</a> ⇒ <code>Promise</code></dt>
<dd><p>sets the runtime environment correctly, there are multiple ways to set the runtime environment (via command line arguments, or via environment variables)
It will prioritize loading via command line argument first, and then environment variables, and finally it will use the last runtime environment</p>
</dd>
<dt><a href="#_route_prefix">_route_prefix(adminPath)</a> ⇒ <code>String</code></dt>
<dd><p>returns a string that&#39;s used in an express router that&#39;s always prefixed with a preceding &#39;/&#39;</p>
</dd>
<dt><a href="#_admin_prefix">_admin_prefix(adminPath)</a> ⇒ <code>String</code></dt>
<dd><p>returns a route string without the precending &#39;/&#39;</p>
</dd>
<dt><a href="#_manifest_prefix">_manifest_prefix(adminPath)</a> ⇒ <code>String</code></dt>
<dd><p>returns a route string that always has a preceding &#39;/&#39; and a suffixed &#39;/&#39;, this is typically used for specifiying links to paths as absolute urls</p>
</dd>
<dt><a href="#all_prefixes">all_prefixes(adminPath)</a> ⇒ <code>String</code></dt>
<dd><p>short hand function to return all prefix types</p>
</dd>
<dt><a href="#formatResponse">formatResponse()</a> ⇒ <code>object</code></dt>
<dd><p>Enforces the shape of an api response, by allow for three properties (result,status and data) all other properties are on data</p>
</dd>
</dl>

<a name="module_periodic"></a>

## periodic
Periodic is an application framework for building enterprise javascript applications.

<a name="configureLowkie"></a>

## configureLowkie() ⇒ <code>Promise</code>
configureLowkie creates a loki connection to store DB based configurations

**Kind**: global function  
**Returns**: <code>Promise</code> - connects to configuration db  
<a name="configureMongoose"></a>

## configureMongoose() ⇒ <code>Promise</code>
configureMongoose creates a mongo connection to store DB based configurations

**Kind**: global function  
**Returns**: <code>Promise</code> - connects to configuration db  
<a name="configureSequelize"></a>

## configureSequelize() ⇒ <code>Promise</code>
configureSequelize creates a mongo connection to store DB based configurations

**Kind**: global function  
**Returns**: <code>Promise</code> - connects to configuration db  
<a name="loadConfiguration"></a>

## loadConfiguration() ⇒
reads content/config/(config.json||config.js) for  the configuration database

**Kind**: global function  
**Returns**: Promise loadConfiguration sets up application config db  
<a name="startTimer"></a>

## startTimer() ⇒
Starts intialization console timer

**Kind**: global function  
**Returns**: Promise  
<a name="endTimer"></a>

## endTimer() ⇒
Ends initialization console timer

**Kind**: global function  
**Returns**: Promise  
<a name="configureViews"></a>

## configureViews() ⇒ <code>Promise</code>
configure express view rendering options

**Kind**: global function  
<a name="initializeExpress"></a>

## initializeExpress() ⇒ <code>Promise</code>
sets the runtime environment correctly

**Kind**: global function  
**Returns**: <code>Promise</code> - configRuntimeEnvironment sets up application config db  
<a name="setUpFolderStructure"></a>

## setUpFolderStructure() ⇒
this will setup a periodic application folder structure if one doesnt exist, it will not overwrite existing configs

**Kind**: global function  
**Returns**: Promise setUpFolderStructure will copy folders from the application __STRUCTURE directory to initialize the application  
<a name="configureLogger"></a>

## configureLogger() ⇒ <code>Promise</code>
configures winston

**Kind**: global function  
**Returns**: <code>Promise</code> - configureLogger sets up winston  
<a name="getEnv"></a>

## getEnv(argv) ⇒ <code>string</code> \| <code>boolean</code>
get the application environment from command line arguments

**Kind**: global function  
**Returns**: <code>string</code> \| <code>boolean</code> - returns the value of the enviroment or false  

| Param | Type | Description |
| --- | --- | --- |
| argv | <code>any</code> | parsed command line arguments |

<a name="setAppRunningEnv"></a>

## setAppRunningEnv(env, operation, processRuntimeConfig) ⇒ <code>boolean</code> \| <code>Promise</code>
sets the application runtime environment and save last run environment into configuration

**Kind**: global function  
**Returns**: <code>boolean</code> \| <code>Promise</code> - returns a resolved promise after configuration database operation  

| Param | Type | Description |
| --- | --- | --- |
| env | <code>any</code> | this is the enviroment variable to set |
| operation | <code>string</code> | either update the config db, or create a new entry for process.runtime |
| processRuntimeConfig | <code>object</code> | existing runtime config from configuration database |

<a name="configRuntimeEnvironment"></a>

## configRuntimeEnvironment() ⇒ <code>Promise</code>
sets the runtime environment correctly, there are multiple ways to set the runtime environment (via command line arguments, or via environment variables)
It will prioritize loading via command line argument first, and then environment variables, and finally it will use the last runtime environment

**Kind**: global function  
**Returns**: <code>Promise</code> - configRuntimeEnvironment sets up application config db  
<a name="_route_prefix"></a>

## _route_prefix(adminPath) ⇒ <code>String</code>
returns a string that's used in an express router that's always prefixed with a preceding '/'

**Kind**: global function  
**Returns**: <code>String</code> - route used for express router, that's always prefixed with a "/"  

| Param | Type |
| --- | --- |
| adminPath | <code>String</code> | 

<a name="_admin_prefix"></a>

## _admin_prefix(adminPath) ⇒ <code>String</code>
returns a route string without the precending '/'

**Kind**: global function  

| Param | Type |
| --- | --- |
| adminPath | <code>String</code> | 

<a name="_manifest_prefix"></a>

## _manifest_prefix(adminPath) ⇒ <code>String</code>
returns a route string that always has a preceding '/' and a suffixed '/', this is typically used for specifiying links to paths as absolute urls

**Kind**: global function  

| Param | Type |
| --- | --- |
| adminPath | <code>String</code> | 

<a name="all_prefixes"></a>

## all_prefixes(adminPath) ⇒ <code>String</code>
short hand function to return all prefix types

**Kind**: global function  

| Param | Type |
| --- | --- |
| adminPath | <code>String</code> | 

<a name="formatResponse"></a>

## formatResponse() ⇒ <code>object</code>
Enforces the shape of an api response, by allow for three properties (result,status and data) all other properties are on data

**Kind**: global function  
**Returns**: <code>object</code> - with the shape {result,status,data}  

| Param | Type | Description |
| --- | --- | --- |
| options.result | <code>string</code> | result of request (usually sucess or error) |
| options.status | <code>number</code> | http resonse code equivalent |
| options.data | <code>object</code> | data for response |

