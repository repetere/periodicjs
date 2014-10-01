#Periodic [![Build Status](https://travis-ci.org/typesettin/periodicjs.svg?branch=master)](https://travis-ci.org/typesettin/periodicjs) [![NPM version](https://badge.fury.io/js/periodicjs.svg)](http://badge.fury.io/js/periodicjs)


## Overview

Periodic is an enterprise information and content management system, designed for you to be able to quickly implement your own information architecture. Periodic is a lightweight application wrapper for [*Express*](http://expressjs.com/), that provides a simple mechanism to handle theming, routes and extensions. 

Unlike some traditional content management solutions, there are no assumptions made about your data model, which allows for information hierarchies and taxonomies to be extremely malleable.


## Installation

Periodic runs with a production grade process manager called PM2, this allows for you application to restart only when necessary and runs as a process in the background. PM2 is a prerequesite for running periodic

```
$ npm install pm2 -g #for running the application
$ npm install nodemon -g #for extention and module development
$ npm install periodicjs@latest 
$ cd periodicjs
$ sudo mongod # you need mongo running
$ npm start #this starts the pm2 daemon process
$ open http://localhost:8786 # there's a login link at the bottom for the admin, or http://localhost:8786/p-admin

```

## Usage

### Content

* **Entities**
	* **Items**
	  * Items are the base content entity, when used in conjunction with content types you can define new types of items with additional custom fields.
	  * Complicated taxonomies and information hierarchies can be created by classifying items with content types, tags and categories.
	  * The Drupal equivalent would be a node, the wordpress equivalent would be a post.
	* **Collections**
		* Collections are a generic grouping of items, they can be used to provide gallery, listicle, and slide show functionilty
		* Like Items, you can create complicated information heirarchies by using custom attributes with content types, tags and categories.
		* In equivalent content management systems, collections are like galleries.
	* **(Media) Assets**
		* Assets are uploaded files, you can create complicated information models and add additional fields with content types
* **Attributes & Taxonomies**
	* **Categories**
		* Categories are an entity attribute that can be nested into logical heirachries, additional attributes can be added with content types
	* **Tags**
		* Tags are an entity attribute that can be nested into logical heirachries, additional attributes can be added with content types
* **Classification**
	* **Content Types**
		* Content Types are collections of additional attributes that can be added to Entities and Attributes.
		* Content Types can be used to create "podcasts", "images", "slideshows", "listicles", "videos" and more by adding additional properties to items, collections, assets, tags and categories.


### Themes
Themes contain views and routes and are installed by uploading to the `content/themes` directory.

Installing/Switching themes
Changing themes can be done through the admin extension interface or manually in your application environment configuration json files.

### Extensions

Extensions are simply node modules that are name-spaced by the extension name prefix 'periodicjs.ext.'. The index.js file is loaded during runtime if the extension is enabled.

Any part of the application can be overwritten via extensions; routes, controllers, views, etc.

#### Installing extensions
```
$ npm install periodicjs.ext.myextension
```
```
$ npm install periodicjs.ext.myextension --skip-install-periodic-ext
```
You can install extensions from the command line via npm, by installing with the *--skip-install-periodic-ext* command line argument, your extension configuration file will not be modified.

####Configuring, Removing, Enabling and Disabling extensions
The state of all extensions are in the `content/extensions/extensions.json` configuration file and is loaded at runtime.

Extensions can be enabled/disabled/removed either manually from *extensions.json* or from the admin extension interface.

###Configuration
####Application Configuration
Your application loads `content/config/config.json` at runtime, here you can modify the runtime environment (or via the command line).

`config.json` will override any settings in your environment specific configurations

####Database Configuration
The Database configuration settings are located in `content/config/database.js`, `database.js` is loaded at runtime. You can modify the environment specific database configuration here.

###Runtimes
Periodic runs with a production grade process manager called PM2, this allows for you application to restart only when necessary and runs as a process in the background.

####Starting Periodic
```
$ npm start
```
Periodic runs with npm, the exact commands are in package.json.

```
$ npm start -p [port] -e [environment]
```
The run time environment can be modified with command line arguments for the specific environment and port settings. **WARNING: anything in config.json will override these settings**

```
$ npm run nd
```
For development purposes only, the nd script runs with nodemon

####Stopping Periodic
```
$ npm stop$ pm2 kill periodicjs
```
Both npm stop and pm2 kill will stop the periodic daemon.

####Restarting Periodic
```
$ npm run reload
```
npm run reload, reloads the pm2 daemon.

###Upgrades
```
$ cd path/to/periodic/directory 
$ npm install periodicjs@latest --upgrade
```
Running npm install periodicjs with the **--upgrade** command line argument installs periodic without modifying which extensions you have installed.

##Development
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt watch
```
$ grunt watch
```

##API


###[*FULL API DOCUMENTATION*](https://github.com/typesettin/typesettin/periodicjs/blob/master/doc/api.md)


<!---

##Notes
* The Navigation Module uses Node's event Emitter for event handling.
* The less file is located in `resources/stylesheets`

### About Linotypes

The linotype machine (/ˈlaɪnətaɪp/ lyn-ə-typ) is a "line casting" machine used in printing. Along with letterpress printing, linotype was the industry standard for newspapers, magazines and posters from the late 19th century to the 1960s and 70s, when it was largely replaced by offset lithography printing and computer typesetting. 

The name of the machine comes from the fact that it produces an entire line of metal type at once, hence a line-o'-type, a significant improvement over the previous industry standard, i.e., manual, letter-by-letter typesetting using a composing stick and drawers of letters.  The linotype machine operator enters text on a 90-character keyboard. 

The machine assembles matrices, which are molds for the letter forms, in a line. The assembled line is then cast as a single piece, called a slug, of type metal in a process known as "hot metal" typesetting. The matrices are then returned to the type magazine from which they came, to be reused later. This allows much faster typesetting and composition than original hand composition in which operators place down one pre-cast metal letter, punctuation mark or space at a time.  

The machine revolutionized typesetting and with it especially newspaper publishing, making it possible for a relatively small number of operators to set type for many pages on a daily basis. Before Mergenthaler's invention of the linotype in 1884, no daily newspaper in the world had more than eight pages.

-->