/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs'),
	extend = require('util-extend'),
	semver = require('semver'),
	path = require('path');
/**
 * A module that represents a extension manager.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module config
 * @requires module:fs
 * @requires module:util-extent
 * @throws {Error} If missing configuration files
 * @todo to do later
 */
var extensions = function(appsettings){
	var extensionFilePath = path.join(path.resolve(__dirname,'../../content/extensions/'), 'extensions.json' ) ,
		extensionsConfig = {},
		extensionsFiles = [];

	var readJSONFile = function(filename) {
		return JSON.parse(fs.readFileSync(filename));
	};

	/** 
	 * gets the configuration information
	 * @return { string } file path for config file
	 */
	this.settings = function(){
		return extensionsConfig;
	};

	this.files = function(){
		return extensionsFiles;
	};

	this.savePluginConfig = function(name,value){
		this[name] = value;
	}.bind(this);

	this.getExtensionFilePath = function(extensionName){
		return path.join(path.resolve(__dirname,'../../content/extensions/node_modules/',extensionName), 'index.js' );
	};

	this.loadExtensions = function(obj){
		extensionsFiles.forEach(function(file){
			require(file)(obj);
		});
	}.bind(this);

	/** 
	 * loads app configuration
	 * @throws {Error} If missing config file
	 */
	this.init = function(appsettings){
		// /** load pluginfile: content/plugin/extensions.json */
		extensionsConfig = readJSONFile(extensionFilePath);

		extensionsConfig.extensions.forEach(function(val,index,arr){
			if(semver.lte(val.periodicCompatibility,appsettings.version)){
				extensionsFiles.push(this.getExtensionFilePath(val.name));
			}
		}.bind(this));
	}.bind(this);

	this.init(appsettings);
};

module.exports = extensions;