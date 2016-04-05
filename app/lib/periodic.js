/*
 * periodicjs
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

/**
 * A module that represents a periodic app.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module periodic
 * @requires express
 * @requires path
 * @requires body-parser
 * @requires cookie-parser
 * @requires serve-favicon
 * @requires response-time
 * @requires compression
 * @requires connect-flash
 * @requires csurf
 * @requires superagent
 * @requires semver
 * @requires connect-mongo
 * @requires morgan
 * @requires module:./config
 * @requires module:../../content/config/logger
 * @requires module:../../content/config/database
 */
var PeriodicCache = require('periodicjs.core.cache');
var initialize = require('./periodic_startup');
const path = require('path');
const Promisie = require('promisie');
const extend = require('utils-merge');
global.CoreCache = new PeriodicCache();

var periodic = function (periodicConfigOptions) {
	var express = require('express'),
		app = express(),
		application_settings,
		extension_helper,
		expressAppLogger = require('morgan'),
		AppLog = require('../../content/config/logger'),
		Config = require('./config'),
		appconfig,
		periodicObj,
		customThemeView = 'home/error500',
		logger,
		database = require(path.join(__dirname, '../../content/config/database')),
		db,
		dburl,
		mngse;
	//https://github.com/expressjs/timeout
	//https://github.com/expressjs/vhost 

	var periodic_configure_obj={
		db : db,
		dburl : dburl,
		mngse : mngse,
		database : database,
		periodicConfigOptions : periodicConfigOptions,
		Config : Config,
		application_settings : application_settings,
		appconfig : appconfig,
		periodicObj: periodicObj,
		extension_helper: extension_helper,
		customThemeView : customThemeView,
		app : app,
		AppLog: AppLog,
		expressAppLogger: expressAppLogger,
		logger: logger
	};
	var periodic_return_obj;

	if(periodicConfigOptions.initialize){
		console.log('using custom initializing');
		initialize = extend(initialize,periodicConfigOptions.initialize);
	}

	var initializeApp = function(options,callback){

		// console.log('initialize',initialize);
		console.time('Application Starting');
		Promisie.promisify(initialize.loadConfiguration)(periodic_configure_obj)
			.then((loadconfiguration_return_object)=>Promisie.promisify(initialize.useLogger)(loadconfiguration_return_object))
			.then((logger_return_object)=>Promisie.promisify(initialize.viewSettings)(logger_return_object))
			.then((viewsettings_return_object)=>Promisie.promisify(initialize.expressSettings)(viewsettings_return_object))
			.then((expresssettings_return_object)=>Promisie.promisify(initialize.staticCaching)(expresssettings_return_object))
			.then((staticcaching_return_object)=>Promisie.promisify(initialize.pageCompression)(staticcaching_return_object))
			.then((pagecompression_return_object)=>Promisie.promisify(initialize.appLogging)(pagecompression_return_object))
			.then((applog_return_object)=>Promisie.promisify(initialize.useSessions)(applog_return_object))
			.then((session_return_object)=>Promisie.promisify(initialize.useLocals)(session_return_object))
			.then((locals_return_object)=>Promisie.promisify(initialize.applicationRouting)(locals_return_object))
			.then((approuting_return_object)=>Promisie.promisify(initialize.serverStatus)(approuting_return_object))
			.then((serverstatus_return_object)=>Promisie.promisify(initialize.catchErrors)(serverstatus_return_object))
			.then((catcherrors_return_object)=>Promisie.promisify(initialize.clearPeriodicCache)(catcherrors_return_object))
			.then((intialized_return_object)=>{
				// init.loadConfiguration();
				// init.useLogger();
				// init.viewSettings();
				// init.expressSettings();
				// init.staticCaching();
				// init.pageCompression();
				// init.appLogging();
				// init.useSessions();
				// init.useLocals();
				// init.applicationRouting();
				// init.serverStatus();
				// init.catchErrors();
				// init.clearPeriodicCache();
				periodic_return_obj= {
					expressapp: intialized_return_object.app,
					appconfig: intialized_return_object.appconfig,
					periodic: intialized_return_object.periodicObj,
					mongoose: intialized_return_object.mngse,
					config: intialized_return_object.periodicConfigOptions,
					port: intialized_return_object.app.get('port')
				};
				callback(null,periodic_return_obj);
				console.timeEnd('Application Starting');
			})
			.catch((e)=>{
				console.timeEnd('Application Starting');
				console.error(e.stack);
				callback(e);
			});
	};

	return {
		init: initializeApp
	};
};

module.exports = periodic;
