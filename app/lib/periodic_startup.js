/*
 * periodicjs
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';
const fs = require('fs-extra');
const path = require('path');
const EJS = require('ejs');
const LRU = require('lru-cache');
const responseTime = require('response-time');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const	cookieParser = require('cookie-parser');
const	favicon = require('serve-favicon');
const express = require('express');
const	compress = require('compression');
const session = require('express-session');
const extend = require('utils-merge');
const csrf = require('csurf');
const request = require('superagent');
const semver = require('semver');
const os = require('os');

/**
 * @description loads the periodic configuration options
 */
exports.loadConfiguration = function (options,callback) {
	try{
		let app = options.app;
		let customThemeView = options.customThemeView;
		let appconfig = options.appconfig;
		let application_settings = options.application_settings;
		let db = options.db;
		let dburl = options.dburl;
		let mngse = options.mngse;
		let database = options.database;
		let periodicConfigOptions = options.periodicConfigOptions;
		let Config = options.Config;

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

		options.db = db;
		options.dburl = dburl;
		options.mngse = mngse;
		options.database = database;
		options.periodicConfigOptions = periodicConfigOptions;
		options.Config = Config;
		options.application_settings = application_settings;
		options.appconfig = appconfig;
		options.customThemeView = customThemeView;
		options.app = app;
		callback(null,options);
	}
	catch(err){
		callback(err);
	}
	
};
/**
 * @description loads application logger configuration
 */
exports.useLogger = function (options,callback) {
	/** winston logger instance based on  configuration settings in content/config/logger.js
	 * @instance
	 */
	try{
		let logger = options.logger;
		let AppLog = options.AppLog;
		let app = options.app;
		fs.ensureDir(path.join(process.cwd(),'logs'),(err)=>{
			logger = new AppLog(app.get('env'));
			process.on('uncaughtException', function (err) {
				logger.error(err.message,err.stack,{
					err:err
				});
			});
			process.on('unhandledRejection', (reason, p) => {
				if(reason.message && reason.stack){
					logger.error(reason.message,reason.stack,{
						reason:err
					});
				}
				else{
					logger.error('unhandledRejection',reason);
				}
		    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
			});
			options.logger = logger;
			options.AppLog = AppLog;
			options.app = app;
			callback(err,options);
		});
	}
	catch(e){
		callback(e);
	}
};
/**
 * @description configure express view rendering options
 * @todo  load view engine from configuration settings to allow for multiple templating engines
 */
exports.viewSettings = function (options,callback) {

	try{
		let application_settings = options.application_settings;
		let app = options.app;
		let viewengine =  application_settings.templateengine || 'ejs';
		app.set('view engine', viewengine);
		app.set('views', path.resolve(__dirname, '../views'));
		if(application_settings.template_lru_cache===true){
			EJS.cache = LRU(100);
		}
		app.engine('html', EJS.renderFile);
		app.engine('ejs',EJS.renderFile);
		if(application_settings.templatepackage!=='ejs'){
			app.engine(application_settings.templatepackage, require(application_settings.templatepackage).renderFile);
		}


		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};
/**
 * @description sets up standard express settings
 */
exports.expressSettings = function (options,callback) {
	try{
		let app = options.app;
		let application_settings = options.application_settings;

		app.use(responseTime(application_settings.express_settings.responseTime));
		app.use(flash());
		app.use(bodyParser.urlencoded(application_settings.express_settings.bodyParser_urlencoded));
		app.use(bodyParser.json(application_settings.express_settings.bodyParser_json));
		app.use(methodOverride());
		app.use(methodOverride('_method'));
		app.use(methodOverride('X-HTTP-Method'));
		app.use(cookieParser(application_settings.cookies.cookieParser));
		app.use(favicon(path.resolve(__dirname, '../../public/favicon.png')));

		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}

};

/**
 * @description set reponse cache settings for static assets, in dev mode disable caching
 */
exports.customExpressSettings = function (options,callback) {
	/** static asset cache settings, in dev mode, disable caching
	 * @instance
	 */
	try{
		let app = options.app;
		let application_settings = options.application_settings;

		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};

/**
 * @description set reponse cache settings for static assets, in dev mode disable caching
 */
exports.staticCaching = function (options,callback) {
	/** static asset cache settings, in dev mode, disable caching
	 * @instance
	 */
	try{
		let app = options.app;
		let application_settings = options.application_settings;

		var expressStaticOptions = (app.get('env') !== 'development' || application_settings.overrideStaticCache === true) ? {
			maxAge: 86400000
		} : {};
		app.use(express.static(path.resolve(__dirname, '../../public'), expressStaticOptions));

		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};
/**
 * @description use gzip compression if enabled in configuration options
 */
exports.pageCompression = function (options,callback) {
	try{
		let app = options.app;
		let application_settings = options.application_settings;

		if (application_settings.expressCompression) {
			app.use(compress());
		}

		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};

/**
 * @description set application logging options
 */
exports.appLogging = function (options,callback) {
	try{
		let app = options.app;
		let application_settings = options.application_settings;
		let expressAppLogger = options.expressAppLogger;

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

		options.expressAppLogger = expressAppLogger;
		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};

/**
 * @description set up express application session configuration
 */
exports.useSessions = function (options,callback) {
	try{
		let app = options.app;
		let application_settings = options.application_settings;
		let expressAppLogger = options.expressAppLogger;
		let database = options.database;
		var MongoStore;
		var RedisStore;

		if (application_settings.sessions.enabled) {
			var express_session_config = {};
			var secure_cookie = (application_settings.sessions.secure_cookie) 
				? application_settings.sessions.secure_cookie
				: {secure:'auto'};
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
			if (application_settings.sessions.type === 'redis') {
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

			// app.use(session(express_session_config));
			if (application_settings.sessions['trust proxy']) {
				express_session_config['trust proxy'] = application_settings.sessions['trust proxy'];
			}
			if (application_settings.sessions.session_name) {
				express_session_config.name = application_settings.sessions.session_name;
			}
			var sessionMiddleware = session(express_session_config);

			app.use(function(req, res, next) {
				if (req.headers.authorization) {
					return next();
				}
				else if (req.query && req.query.skip_session && (req.query.skip_session==='true' || req.query.skip_session===true)) {
					return next();
				}
				else if (req.controllerData && req.controllerData.skip_session && (req.controllerData.skip_session==='true' || req.controllerData.skip_session===true)) {
					return next();
				}
				else{
					return sessionMiddleware(req, res, next);
				}
			});

			/**
			 * @description cross site request forgery settings
			 */
			if (application_settings.crsf) {
				app.use(csrf());
			}
		}

		options.database = database;
		options.expressAppLogger = expressAppLogger;
		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};


/**
 * @description template rendering helper functions and objects
 */
exports.useLocals = function (options, callback) {
	try{
		let app = options.app;
		let application_settings = options.application_settings;

		app.locals = require('./staticviewhelper');
		app.locals.appenvironment = application_settings.application.environment;
		app.locals.appname = application_settings.name;
		app.locals.additionalHTMLFunctions =[];
		app.use(function (req, res, next) {
			res.locals.token = (application_settings.crsf) ? req.csrfToken() : '';
			next();
		});
		app.use(function (req, res, next) {
			res.locals.additionalHeadHTML ={};
			res.locals.additionalFooterHTML ={};
			res.locals.additionalPreContentHTML ={};
			res.locals.additionalPostContentHTML ={};
			res.locals['x-forwarded-for'] = req.headers['x-forwarded-for'];
			res.locals.remoteAddress =  req.connection.remoteAddress;
			app.locals.isLoggedIn = function (isloggedinoptions) {
				if(isloggedinoptions){
					console.log(isloggedinoptions);
				}
				return req.user;
			};
			next();
		});

		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};

/**
 * @description application routing options
 */
exports.applicationRouting = function (options, callback) {
	/**
	 * @description application reference passed to controllers
	 * @instance
	 */

	try{
		let app = options.app;
		let application_settings = options.application_settings;
		let periodicObj = options.periodicObj;
		let logger = options.logger;
		let mngse = options.mngse;
		let db = options.db;
		let extension_helper = options.extension_helper;
		let periodicConfigOptions = options.periodicConfigOptions;

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
			if ( periodicConfigOptions!=='undefined' && typeof periodicConfigOptions.skip_install_check!=='undefined' && periodicConfigOptions.skip_install_check===true){
				periodicObj = require('../routes/index')(periodicObj);
			}
			else if (fs.existsSync(path.resolve(__dirname, '../../node_modules/periodicjs.ext.install')) && application_settings.status === 'install') {
				periodicObj = require('periodicjs.ext.install')(periodicObj);
			}
			else {
				periodicObj = require('../routes/index')(periodicObj);
				extension_helper = require('./extensionhelper')(periodicObj);
				extension_helper.useCronTasks();
			}
		}
		options.periodicConfigOptions = periodicConfigOptions;
		options.extension_helper = extension_helper;
		options.periodicObj = periodicObj;
		options.mngse = mngse;
		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};

/**
 * @description application server status
 */
exports.serverStatus = function (options, callback) {
	try{
		let app = options.app;
		let application_settings = options.application_settings;
		let logger = options.logger;


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


		options.logger = logger;
		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};

/**
 * @description exception catching settings
 */
exports.catchErrors = function (options, callback) {
	try{
		let app = options.app;
		let logger = options.logger;
		let application_settings = options.application_settings;
		let customThemeView = options.customThemeView;

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
					referer: req.headers.referer,
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

		options.logger = logger;
		options.customThemeView = customThemeView;
		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};

/**
 * @clear periodic cache settings settings
 */
exports.clearPeriodicCache = function (options,callback) {
	// console.log('global.CoreCache.clearCache',global.CoreCache.clearCache);
	try{
		let app = options.app;
		let application_settings = options.application_settings;
		let logger = options.logger;

		var t = setTimeout(function(){
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
		},3000);

		options.logger = logger;
		options.application_settings = application_settings;
		options.app = app;
		callback(null,options);
	}
	catch(e){
		callback(e);
	}
};