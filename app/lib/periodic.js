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
		EJS = require('ejs'),
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
		periodicObj,
		customThemeView = 'home/error500',
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
		/** if cache option is set update cache */
		if (appconfig.settings().periodic_cache_status !== 'undefined') {
			global.CoreCache.setStatus(appconfig.settings().periodic_cache_status);
		}

		/** if custom error page */
		if(appconfig.settings().theme){
			var custom500errorpage = path.join(path.resolve(process.cwd(), './content/themes'), appconfig.settings().theme, 'views', 'home/error500' + '.' + appconfig.settings().templatefileextension),
				custom500ErrorPageError,
				custom500ErrorPageView;
			try{
				custom500ErrorPageView = fs.readFileSync(custom500errorpage);
			}
			catch(themecustompageerror){
				custom500ErrorPageError = themecustompageerror;
			}
			customThemeView = (custom500ErrorPageView) ? custom500errorpage : customThemeView;
			appconfig.setSetting('customThemeView', customThemeView);
		}
		app.enable('trust proxy');
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
			logger.error(err.message,err.stack,{
				err:err
			});
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
		app.engine('html', EJS.renderFile);
		app.engine('ejs',EJS.renderFile);
		if(appconfig.settings().templatepackage!=='ejs'){
			app.engine(appconfig.settings().templatepackage, require(appconfig.settings().templatepackage).renderFile);
		}
	};
	/**
	 * @description sets up standard express settings
	 */
	init.expressSettings = function () {
		// console.log('appconfig.settings().express_settings',appconfig.settings().express_settings);
		app.use(responseTime(appconfig.settings().express_settings.responseTime));
		app.use(flash());
		app.use(bodyParser.urlencoded(appconfig.settings().express_settings.bodyParser_urlencoded));
		app.use(bodyParser.json(appconfig.settings().express_settings.bodyParser_json));
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
				var dbconfig = database[app.get('env')];
				express_session_config = {
					secret: appconfig.settings().session_secret,
					maxAge: new Date(Date.now() + 3600000),
					store: new MongoStore({ mongooseConnection: dbconfig.mongoose.connection }),
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
			res.locals['x-forwarded-for'] = req.headers['x-forwarded-for'];
			res.locals.remoteAddress =  req.connection.remoteAddress;
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
		periodicObj = {
			express: express,
			app: app,
			logger: logger,
			settings: appconfig.settings(),
			db: db,
			mongoose: mngse
		};
		periodicObj.app.controller ={
			native:{},
			extension:{}
		};
		if(periodicConfigOptions && periodicConfigOptions.skiprouting){
			logger.silly('skipping routing',periodicConfigOptions.skiprouting);
		}
		else{
			if (fs.existsSync(path.resolve(process.cwd(),'node_modules','periodicjs.ext.install')) && appconfig.settings().status === 'install') {
				periodicObj = require('periodicjs.ext.install')(periodicObj);
			}
			else {
				periodicObj = require('../routes/index')(periodicObj);
			}
		}
	};
	/**
	 * @description application server status
	 */
	init.serverStatus = function () {
		logger.debug('Express server listening on port ' + app.get('port'));
		logger.debug('Running in environment: ' + app.get('env'));
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
						logger.debug('Your instance of Periodicjs ' + appconfig.settings().version + ' is up to date with the current version ' + latestPeriodicVersion);
					}
					else {
						console.log('\u0007');
						logger.debug('====================================================');
						logger.debug('|                                                  |');
						logger.debug('| Your instance of Periodic is out of date.        |');
						logger.debug('| Your Version: ' + appconfig.settings().version + ', Current Version: ' + latestPeriodicVersion + '      |');
						logger.debug('|                                                  |');
						logger.debug('====================================================');
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
			// console.log('err',err,'next',next);
			logger.error(err.message,err.stack,{
				err:err,
				ipinfo:{
					'x-forwarded-for': req.headers['x-forwarded-for'],
					remoteAddress: req.connection.remoteAddress,
					originalUrl: req.originalUrl,
					headerHost: req.headers.host
				}
			});
			// logger.error(err.stack);
			next(err);
		});

		//send client errors
		//catch all errors
		app.use(function (err, req, res, next) {
			if(!err){
				next();
			}
			else if (req.query.format==='json' || req.is('json') || req.is('application/json')) {
				res.status(500);
				res.send({
					error: 'Something blew up!'
				});
			}
			else  {
				res.status(500);
				res.render(customThemeView, {
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
					logger.debug(status);
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
		appconfig: appconfig,
		mongoose: mngse,
		config: periodicConfigOptions,
		port: app.get('port')
	};
};

module.exports = periodic;