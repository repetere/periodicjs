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
 * A module that represents a plugin manager.
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
var plugins = function(appsettings){
	var pluginFilePath = path.join(path.resolve(__dirname,'../../content/plugins/'), 'plugins.json' ) ,
		pluginConfig = {},
		pluginFiles = [];

	var readJSONFile = function(filename) {
		return JSON.parse(fs.readFileSync(filename));
	};

	/** 
	 * gets the configuration information
	 * @return { string } file path for config file
	 */
	this.settings = function(){
		return pluginConfig;
	};

	this.files = function(){
		return pluginFiles;
	};

	this.savePluginConfig = function(name,value){
		this[name] = value;
	}.bind(this);

	this.getPluginFilePath = function(pluginName){
		return path.join(path.resolve(__dirname,'../../content/plugins/node_modules/',pluginName), 'index.js' );
	};

	this.loadPlugins = function(express,app,logger,config){
		pluginFiles.forEach(function(file){
			require(file)(express,app,logger,config);
		});
	}.bind(this);

	/** 
	 * loads app configuration
	 * @throws {Error} If missing config file
	 */
	this.init = function(appsettings){
		// /** load pluginfile: content/plugin/plugins.json */
		pluginConfig = readJSONFile(pluginFilePath);

		pluginConfig.plugins.forEach(function(val,index,arr){
			if(semver.lte(val.periodicCompatibility,appsettings.version)){
				pluginFiles.push(this.getPluginFilePath(val.name));
			}
		}.bind(this));
	}.bind(this);

	this.init(appsettings);
};

module.exports = plugins;