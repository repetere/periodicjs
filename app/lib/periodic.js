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
		extend = require('utils-merge'),
		os = require('os'),
		EJS = require('ejs'),
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
		MongoStore,
		RedisStore,
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
		appconfig = new Config(periodicConfigOptions);
		application_settings =  appconfig.settings();
		app.set('port', application_settings.application.port);
		app.set('env', application_settings.application.environment);
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
		if (application_settings.debug) {
			console.log(application_settings);
		}
		/** if cache option is set update cache */
		if (application_settings.periodic_cache_status !== 'undefined') {
			global.CoreCache.setStatus(application_settings.periodic_cache_status);
		}

		/** if custom error page */
		if(application_settings.theme){
			var custom500errorpage = path.join(path.resolve(__dirname, '../../content/themes'), application_settings.theme, 'views', 'home/error500' + '.' + application_settings.templatefileextension),
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
		var viewengine =  application_settings.templateengine || 'ejs';
		app.set('view engine', viewengine);
		app.set('views', path.resolve(__dirname, '../views'));
		app.engine('html', EJS.renderFile);
		app.engine('ejs',EJS.renderFile);
		if(application_settings.templatepackage!=='ejs'){
			app.engine(application_settings.templatepackage, require(application_settings.templatepackage).renderFile);
		}
	};
	/**
	 * @description sets up standard express settings
	 */
	init.expressSettings = function () {
		app.use(responseTime(application_settings.express_settings.responseTime));
		app.use(flash());
		app.use(bodyParser.urlencoded(application_settings.express_settings.bodyParser_urlencoded));
		app.use(bodyParser.json(application_settings.express_settings.bodyParser_json));
		app.use(methodOverride());
		app.use(cookieParser(application_settings.cookies.cookieParser));
		app.use(favicon(path.resolve(__dirname, '../../public/favicon.png')));
	};
	/**
	 * @description set reponse cache settings for static assets, in dev mode disable caching
	 */
	init.staticCaching = function () {
		/** static asset cache settings, in dev mode, disable caching
		 * @instance
		 */
		var expressStaticOptions = (app.get('env') !== 'development' || application_settings.overrideStaticCache === true) ? {
			maxAge: 86400000
		} : {};
		app.use(express.static(path.resolve(__dirname, '../../public'), expressStaticOptions));
	};
	/**
	 * @description use gzip compression if enabled in configuration options
	 */
	init.pageCompression = function () {
		if (application_settings.expressCompression) {
			app.use(compress());
		}
	};
	/**
	 * @description set application logging options
	 */
	init.appLogging = function () {
		if (application_settings.debug) {
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
			if (application_settings.status !== 'install') {
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
		if (application_settings.sessions.enabled) {
			var express_session_config = {};
			var secure_cookie = (application_settings.sessions.secure_cookie) ? {secure:true}: {secure:'auto'};
			var maxage_in_milliseconds = application_settings.sessions.maxage_in_milliseconds || 3600000;
			var session_ttl_in_seconds = application_settings.sessions.ttl_in_seconds ||300;
			if (application_settings.sessions.type === 'mongo' && application_settings.status !== 'install') {
				MongoStore = require('connect-mongo')(session);
				var dbconfig = database[app.get('env')];
				express_session_config = {
					secret: application_settings.session_secret,
					maxAge: new Date(Date.now() + maxage_in_milliseconds),
					store: new MongoStore({ mongooseConnection: dbconfig.mongoose.connection,ttl:session_ttl_in_seconds }),
					resave: true,
					saveUninitialized: true,
					cookie: secure_cookie
				};
			}
			else 
			if (application_settings.sessions.type === 'redis' && application_settings.status !== 'install') {
				RedisStore = require('connect-redis')(session);
				var redisconfig  = application_settings.redis_config;
				if((!redisconfig.port || !redisconfig.host) ){
					var redis_url = require('redis-url');
					redisconfig = extend(redisconfig,redis_url.parse(redisconfig.url));
					if(redisconfig.password){
						redisconfig.pass = redisconfig.password;
					}
					redisconfig.host = redisconfig.hostname;
					redisconfig.ttl = session_ttl_in_seconds;
				}
				redisconfig.ttl = (typeof redisconfig.ttl !=='undefined')? redisconfig.ttl : session_ttl_in_seconds;
				express_session_config = {
					secret: application_settings.session_secret,
					maxAge: new Date(Date.now() + maxage_in_milliseconds),
					store: new RedisStore(redisconfig),
					resave: true,
					saveUninitialized: true,
					cookie: secure_cookie
				};
			}
			else {
				express_session_config = {
					secret: application_settings.session_secret,
					maxAge: new Date(Date.now() + maxage_in_milliseconds),
					resave: true,
					saveUninitialized: true,
					cookie: secure_cookie
				};
			}

			app.use(session(express_session_config));

			/**
			 * @description cross site request forgery settings
			 */
			if (application_settings.crsf) {
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
			app.locals.token = (application_settings.crsf) ? req.csrfToken() : '';
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
			settings: application_settings,
			db: db,
			mongoose: mngse
		};
		periodicObj.app.controller ={
			native:{},
			extension:{}
		};
		if(periodicConfigOptions && periodicConfigOptions.skiprouting){
			if(application_settings.debug){
				logger.silly('skipping routing',periodicConfigOptions.skiprouting);
			}
		}
		else{
			if (fs.existsSync(path.resolve(__dirname, '../../node_modules/periodicjs.ext.install')) && application_settings.status === 'install') {
				periodicObj = require('periodicjs.ext.install')(periodicObj);
			}
			else {
				periodicObj = require('../routes/index')(periodicObj);
			}
			extension_helper = require('./extensionhelper')(periodicObj);
			// extension_helper.useCronTasks();

		}
	};
	/**
	 * @description application server status
	 */
	init.serverStatus = function () {
		if(application_settings.debug){
			logger.debug('Running in environment: ' + app.get('env'));
		}
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
					if (semver.gte(application_settings.version, latestPeriodicVersion)) {
						if(application_settings.debug){
							logger.debug('Your instance of Periodicjs ' + application_settings.version + ' is up to date with the current version ' + latestPeriodicVersion);
						}
					}
					else {
						console.log('\u0007');
						logger.debug('====================================================');
						logger.debug('|                                                  |');
						logger.debug('| Your instance of Periodic is out of date.        |');
						logger.debug('| Your Version: ' + application_settings.version + ', Current Version: ' + latestPeriodicVersion + '      |');
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
			var userdata = {};		
			if (req && req.user && req.user.email) {		
				userdata = {		
					email:req.user.email,		
					username:req.user.username,		
					firstname:req.user.firstname,		
					lastname:req.user.lastname		
				};		
			}
			logger.error(err.message,err.stack,{
				err:err,
				ipinfo:{
					date: new Date(),
					'x-forwarded-for': req.headers['x-forwarded-for'],
					remoteAddress: req.connection.remoteAddress,
					originalUrl: req.originalUrl,
					headerHost: req.headers.host,
					userAgent: req.headers['user-agent'],
					user: userdata,
					osHostname: os.hostname()
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
					error: err
				});
			}
			else  {
				res.status(500);
				res.render(customThemeView, {
					user: req.user,
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
			if(application_settings.periodic_cache_settings){
				application_settings.periodic_cache_settings.debug = application_settings.debug;
				global.CoreCache.setOptions(application_settings.periodic_cache_settings);
			}
			global.CoreCache.clearCache(function(err,status){
				console.timeEnd('clearing periodic cache');
				if(err){
					logger.error(err);
				}
				else if(application_settings.debug){
					logger.debug(status);
				}
			});
		}
	};
	
	console.time('Application Starting');
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
	console.timeEnd('Application Starting');

	return {
		expressapp: app,
		appconfig: appconfig,
		periodic: periodicObj,
		mongoose: mngse,
		config: periodicConfigOptions,
		port: app.get('port')
	};
};

module.exports = periodic;
