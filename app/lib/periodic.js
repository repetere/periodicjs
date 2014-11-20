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
global.CoreCache = new PeriodicCache();

var periodic = function (periodicConfigOptions) {
	var express = require('express'),
		path = require('path'),
		bodyParser = require('body-parser'),
		methodOverride = require('method-override'),
		cookieParser = require('cookie-parser'),
		favicon = require('serve-favicon'),
		session = require('express-session'),
		responseTime = require('response-time'),
		compress = require('compression'),
		flash = require('connect-flash'),
		csrf = require('csurf'),
		fs = require('fs-extra'),
		request = require('superagent'),
		semver = require('semver'),
		app = express(),
		MongoStore = require('connect-mongo')(session),
		expressAppLogger = require('morgan'),
		AppLog = require('../../content/config/logger'),
		Config = require('./config'),
		appconfig,
		logger,
		database = require('../../content/config/database'),
		db,
		dburl,
		mngse;
	//https://github.com/expressjs/timeout
	//https://github.com/expressjs/vhost 


	/** initializes periodic express configuration options
	 * @exports periodic/init
	 * @memberOf periodic
	 */
	var init = {};
	/**
	 * @description loads the periodic configuration options
	 */
	init.loadConfiguration = function () {
		/** creates instance of configuration object
		 * @instance
		 */
		appconfig = new Config();
		app.set('port', appconfig.settings().application.port);
		app.set('env', appconfig.settings().application.environment);
		/** environment based database configuration
		 * @instance
		 */
		db = database[app.get('env')];
		appconfig.setSetting('dburl', db.url);

		/** shortcut to db url in content/config/database.js
		 * @instance
		 */
		dburl = db.url;
		/** instance of mongoose connection based on configuration settings in content/config/database.js
		 * @instance
		 */
		mngse = db.mongoose;
		/** if debug option is set output instance configuration */
		if (appconfig.settings().debug) {
			console.log(appconfig.settings());
		}
	};
	/**
	 * @description loads application logger configuration
	 */
	init.useLogger = function () {
		/** winston logger instance based on  configuration settings in content/config/logger.js
		 * @instance
		 */
		logger = new AppLog(app.get('env'));
		process.on('uncaughtException', function (err) {
			logger.error(err.stack);
			logger.error(err.message);
		});
	};
	/**
	 * @description configure express view rendering options
	 * @todo  load view engine from configuration settings to allow for multiple templating engines
	 */
	init.viewSettings = function () {
		var viewengine =  appconfig.settings().templateengine || 'ejs';
		app.set('view engine', viewengine);
		app.set('views', path.resolve(__dirname, '../views'));
		app.engine('html', require('ejs').renderFile);
		app.engine('ejs', require('ejs').renderFile);
		if(viewengine !== 'ejs'){
			app.engine(viewengine, require(appconfig.settings().templatepackage).renderFile);
		}
	};
	/**
	 * @description sets up standard express settings
	 */
	init.expressSettings = function () {
		app.use(responseTime({digits:5}));
		app.use(flash());
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json());
		app.use(methodOverride());
		app.use(cookieParser(appconfig.settings().cookies.cookieParser));
		app.use(favicon(path.resolve(__dirname, '../../public/favicon.png')));
	};
	/**
	 * @description set reponse cache settings for static assets, in dev mode disable caching
	 */
	init.staticCaching = function () {
		/** static asset cache settings, in dev mode, disable caching
		 * @instance
		 */
		var expressStaticOptions = (app.get('env') !== 'development' || appconfig.settings().overrideStaticCache === true) ? {
			maxAge: 86400000
		} : {};
		app.use(express.static(path.resolve(__dirname, '../../public'), expressStaticOptions));
	};
	/**
	 * @description use gzip compression if enabled in configuration options
	 */
	init.pageCompression = function () {
		if (appconfig.settings().expressCompression) {
			app.use(compress());
		}
	};
	/**
	 * @description set application logging options
	 */
	init.appLogging = function () {
		if (appconfig.settings().debug) {
			expressAppLogger.token('colorstatus', function (req, res) {
				var color = 32; // green
				var status = res.statusCode;

				if (status >= 500) {
					color = 31;
				} // red
				else if (status >= 400) {
					color = 33;
				} // yellow
				else if (status >= 300) {
					color = 36;
				} // cyan
				return '\x1b[' + color + 'm' + status + '\x1b[90m';
			});
			expressAppLogger.format('app', '\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m');
			if (appconfig.settings().status !== 'install') {
				app.use(expressAppLogger( 'app', 
					{
						format:'\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
					}
				));
			}
			else {
				app.use(expressAppLogger( 'app', 
					{
						format:'\x1b[90m:remote-addr :method \x1b[37m:url\x1b[90m :colorstatus \x1b[97m:response-time ms\x1b[90m :date :referrer :user-agent\x1b[0m'
					}
				));
			}
		}
	};
	/**
	 * @description set up express application session configuration
	 */
	init.useSessions = function () {
		if (appconfig.settings().sessions.enabled) {
			var express_session_config = {};
			if (appconfig.settings().sessions.type === 'mongo' && appconfig.settings().status !== 'install') {
				express_session_config = {
					secret: appconfig.settings().session_secret,
					maxAge: new Date(Date.now() + 3600000),
					store: new MongoStore({
						url: database[app.get('env')].url
					}),
					resave: true,
					saveUninitialized: true
				};
			}
			else {
				express_session_config = {
					secret: appconfig.settings().session_secret,
					maxAge: new Date(Date.now() + 3600000),
					resave: true,
					saveUninitialized: true
				};
			}

			app.use(session(express_session_config));

			/**
			 * @description cross site request forgery settings
			 */
			if (appconfig.settings().crsf) {
				app.use(csrf());
			}
		}
	};
	/**
	 * @description template rendering helper functions and objects
	 */
	init.useLocals = function () {
		app.locals = require('./staticviewhelper');
		app.locals.additionalHTMLFunctions =[];
		app.use(function (req, res, next) {
			app.locals.token = (appconfig.settings().crsf) ? req.csrfToken() : '';
			next();
		});
		app.use(function (req, res, next) {
			res.locals.additionalHeadHTML ={};
			res.locals.additionalFooterHTML ={};
			res.locals.additionalPreContentHTML ={};
			res.locals.additionalPostContentHTML ={};
			app.locals.isLoggedIn = function () {
				return req.user;
			};
			next();
		});
	};
	/**
	 * @description application routing options
	 */
	init.applicationRouting = function () {
		/**
		 * @description application reference passed to controllers
		 * @instance
		 */
		var periodicObj = {
			express: express,
			app: app,
			logger: logger,
			settings: appconfig.settings(),
			db: db,
			mongoose: mngse
		};
		if(periodicConfigOptions && periodicConfigOptions.skiprouting){
			logger.silly('skipping routing',periodicConfigOptions.skiprouting);
		}
		else{
			if (fs.existsSync(path.resolve(process.cwd(),'node_modules','periodicjs.ext.install')) && appconfig.settings().status === 'install') {
				require('periodicjs.ext.install')(periodicObj);
			}
			else {
				require('../routes/index')(periodicObj);
			}
		}
	};
	/**
	 * @description application server status
	 */
	init.serverStatus = function () {
		logger.info('Express server listening on port ' + app.get('port'));
		logger.info('Running in environment: ' + app.get('env'));
		request
			.get('https://registry.npmjs.org/periodicjs')
			.set('Accept', 'application/json')
			.end(function (err, res) {
				if (res && res.error) {
					logger.warn(res.error);
				}
				if (err) {
					logger.warn('Could not check latest version of Periodic - ', err);
				}
				else {
					var latestPeriodicVersion = res.body['dist-tags'].latest;
					if (semver.gte(appconfig.settings().version, latestPeriodicVersion)) {
						logger.info('Your instance of Periodicjs ' + appconfig.settings().version + ' is up to date with the current version ' + latestPeriodicVersion);
					}
					else {
						console.log('\u0007');
						logger.warn('====================================================');
						logger.warn('|                                                  |');
						logger.warn('| Your instance of Periodic is out of date.        |');
						logger.warn('| Your Version: ' + appconfig.settings().version + ', Current Version: ' + latestPeriodicVersion + '      |');
						logger.warn('|                                                  |');
						logger.warn('====================================================');
					}
				}
			});
	};
	/**
	 * @description exception catching settings
	 */
	init.catchErrors = function () {
		//log errors
		app.use(function (err, req, res, next) {
			logger.error(err.message);
			logger.error(err.stack);
			next(err);
		});

		//send client errors
		//catch all errors
		app.use(function (err, req, res, next) {
			if (req.xhr) {
				res.send(500, {
					error: 'Something blew up!'
				});
			}
			else {
				res.status(500);
				// if(appconfig.settings().theme)
				res.render('home/error500', {
					message: err.message,
					error: err
				});
			}
		});
	};
	/**
	 * @clear periodic cache settings settings
	 */
	init.clearPeriodicCache = function () {
		// console.log('global.CoreCache.clearCache',global.CoreCache.clearCache);
		if(global.CoreCache){
			console.time('clearing periodic cache');
			if(appconfig.settings().periodic_cache_settings){
				global.CoreCache.setOptions(appconfig.settings().periodic_cache_settings);
			}
			global.CoreCache.clearCache(function(err,status){
				console.timeEnd('clearing periodic cache');
				if(err){
					logger.error(err);
				}
				else{
					logger.info(status);
				}
			});
		}
	};
	
	console.time('Server Starting');
	init.loadConfiguration();
	init.useLogger();
	init.viewSettings();
	init.expressSettings();
	init.staticCaching();
	init.pageCompression();
	init.appLogging();
	init.useSessions();
	init.useLocals();
	init.applicationRouting();
	init.serverStatus();
	init.catchErrors();
	init.clearPeriodicCache();
	console.timeEnd('Server Starting');

	return {
		expressapp: app,
		mongoose: mngse,
		config: periodicConfigOptions,
		port: app.get('port')
	};
};

module.exports = periodic;
