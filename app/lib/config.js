/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs'),
	extend = require('util-extend'),
	path = require('path'),
	argv = require('optimist').argv;
/**
 * A module that represents a platter.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module config
 * @requires module:fs
 * @requires module:util-extent
 * @requires module:optimist
 * @throws {Error} If missing configuration files
 * @todo to do later
 */
var config = function(){
	var appEnvironment = argv.e,
		appPort = argv.p,
		configurationFile,
		configurationOverrideFile = path.join(path.resolve(__dirname,'../../content/config/'), 'config.json' ) ,
		configurationDefaultFile,
		configurationFileJSON,
		configurationOverrideFileJSON,
		config ={};
	// this.settings = {
	// 	application : {
	// 		environment : 'development',
	// 		port : 8080
	// 	}
	// };
	// this.config = {};
	// 
	// console.log("argv",argv);
	// console.log("configurationFile",configurationFile);
	// 
	var readJSONFile = function(filename) {
		return JSON.parse(fs.readFileSync(filename));
	};

	/** 
	 * gets the configuration information
	 * @return { string } file path for config file
	 */
	this.settings = function(){
		return config;
	};

	/** 
	 * generate file path for config files
	 * @return { string } file path for config file
	 */
	this.getConfigFilePath = function(config){
		var directory = path.resolve(__dirname,'../../content/config/environment/'),
			file = config+'.json';
		return  path.join(directory,file);
	};

	/** 
	 * loads app configuration
	 * @throws {Error} If missing config file
	 */
	this.init = function(){
		/** load user config file: content/config/config.json */
		configurationOverrideFileJSON = readJSONFile(configurationOverrideFile);

		/** set path of default config: content/config/environment/default.json */
		configurationDefaultFile = this.getConfigFilePath('default');

		/** if no command line argument, use environment from user config file */
		appEnvironment = (argv.e) ?
			argv.e : (typeof configurationOverrideFileJSON.application !== 'undefined' && typeof configurationOverrideFileJSON.application.environment !== 'undefined') ?
				configurationOverrideFileJSON.application.environment : null;

		/** set & load file path for base environment config */
		configurationFile = this.getConfigFilePath(appEnvironment);
		configurationFileJSON = (fs.exists(configurationFile)) ?  readJSONFile(configurationFile) : readJSONFile(configurationDefaultFile);

		/** override environment data with user config */
		config = extend (configurationFileJSON,configurationOverrideFileJSON);

		/** override port with command line argument */
		config.application.port = (appPort) ? appPort : config.application.port;
	}.bind(this);

	this.init();
};

module.exports = config;