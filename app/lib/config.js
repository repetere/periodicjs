/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
	extend = require('util-extend'),
	path = require('path'),
	argv = require('optimist').argv;
/**
 * A module that loads configurations for express and periodic.
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
var config = function () {
	var appEnvironment = argv.e,
		appPort = argv.p,
		packagejsonFileJSON,
		configurationFile,
		configurationOverrideFile = path.join(path.resolve(__dirname, '../../content/config/'), 'config.json'),
		configurationDefaultFile,
		configurationFileJSON,
		configurationOverrideFileJSON,
		configurationDefaultFileJSON,
		lastRuntimeEnvironment,
		lastRuntimeEnvironmentFilePath = path.resolve(process.cwd(), 'content/config/process/runtime.json'),
		config = {};

	/** 
	 * gets the configuration information
	 * @return { object } current instance configuration
	 */
	this.settings = function () {
		return config;
	};

	/** 
	 * augments the configuration information
	 * @augments {object} appends instance configuration
	 * @param {string} name name of new configuration setting
	 * @param {value} value value of new configuration setting
	 */
	this.setConfig = function (name, value) {
		this[name] = value;
	}.bind(this);


	/** 
	 * augments the configuration information
	 * @augments {object} appends instance configuration
	 * @param {string} name name of new configuration setting
	 * @param {value} value value of new configuration setting
	 */
	this.setSetting = function (name, value) {
		config[name] = value;
	}.bind(this);

	/** 
	 * generate file path for config files
	 * @return { string } file path for config file
	 */
	this.getConfigFilePath = function (config) {
		var directory = path.resolve(__dirname, '../../content/config/environment/'),
			file = config + '.json';
		return path.join(directory, file);
	};

	/** 
	 * loads app configuration
	 * @throws {Error} If missing config file
	 * @this {object} configuration instance
	 */
	this.init = function () {
		/** get info from package.json */
		packagejsonFileJSON = fs.readJSONSync(path.resolve(process.cwd(), './package.json'));
		/** get info from last runtime environemnt */
		if(fs.existsSync(lastRuntimeEnvironmentFilePath)){
			lastRuntimeEnvironment = fs.readJSONSync(lastRuntimeEnvironmentFilePath).environment;
		}

		/** load user config file: content/config/config.json */
		configurationOverrideFileJSON = fs.readJSONSync(configurationOverrideFile);

		/** set path of default config: content/config/environment/default.json */
		configurationDefaultFile = this.getConfigFilePath('default');
		configurationDefaultFileJSON = fs.readJSONSync(configurationDefaultFile);

		/** if no command line argument, use environment from user config file */
		if (process.env.NODE_ENV) {
			appEnvironment = process.env.NODE_ENV;
		}
		else if(argv.e){
			appEnvironment = argv.e;
		}
		else if(lastRuntimeEnvironment){
			appEnvironment = lastRuntimeEnvironment;
		}
		else if(typeof configurationOverrideFileJSON.application !== 'undefined' && typeof configurationOverrideFileJSON.application.environment !== 'undefined'){
			appEnvironment = configurationOverrideFileJSON.application.environment;
		}
		else {
			appEnvironment = 'development';
		}

		//** save last runtime environment to load as a backup */
		fs.outputJson(path.resolve(process.cwd(),'content/config/process/runtime.json'),{environment:appEnvironment},function(err){
			if(err){
				console.error(err);
			}
			else{
				console.log('saved runtime environment',appEnvironment);
			}
		});

		/** set & load file path for base environment config */
		configurationFile = this.getConfigFilePath(appEnvironment);

		/** override environment data with user config */
		config = extend(config, configurationDefaultFileJSON);
		if (fs.existsSync(configurationFile)) {
			configurationFileJSON = fs.readJSONSync(configurationFile);
			config = extend(config, configurationFileJSON);
		}
		config = extend(config, configurationOverrideFileJSON);
		config.version = packagejsonFileJSON.version;

		/** override port with command line argument */
		config.application.port = (appPort) ? appPort : config.application.port;

		/** if theme is set in configuration, set filepath */
		if (config.theme) {
			config.themepath = path.join(__dirname, '../../content/themes', config.theme);
		}
	}.bind(this);

	this.init();
};

module.exports = config;
