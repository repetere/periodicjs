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
 * @requires express-session
 * @requires silkscreenjs
 * @requires codemirror
 * @requires less
 * @requires filesaver.js
 * @requires jszip
 * @requires ejs
 * @requires path
 * @requires util
 * @todo to do later
 */
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
	request = require('superagent'),
	semver = require('semver'),
	app = express(),
	MongoStore = require('connect-mongo')(session),
	expressAppLogger = require('morgan'),
	appLog = require('../../content/config/logger'),
	config = require('./config'),
	appconfig,
	logger,
	database = require('../../content/config/database'),
	db,
	dburl,
	mngse;
//https://github.com/expressjs/timeout
//https://github.com/expressjs/vhost 

var init = {
	loadConfiguration: function () {
		appconfig = new config();
		app.set('port', appconfig.settings().application.port);
		app.set('env', appconfig.settings().application.environment);
		db = database[app.get('env')];
		dburl = db.url;
		mngse = db.mongoose;
	},
	useLogger: function () {
		logger = new appLog(app.get('env'));
		process.on('uncaughtException', function (err) {
			logger.error(err.stack);
			logger.error(err.message);
		});
	},
	viewSettings: function () {
		app.set('view engine', 'ejs');
		app.set('views', path.resolve(__dirname, '../views'));
		app.engine('html', require('ejs').renderFile);
		app.engine('ejs', require('ejs').renderFile);
	},
	expressSettings: function () {
		app.use(responseTime(5));
		app.use(flash());
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json());
		app.use(methodOverride());
		app.use(cookieParser(appconfig.settings().cookies.cookieParser));
		app.use(favicon(path.resolve(__dirname, '../../public/favicon.png')));
	},
	staticCaching: function () {
		var expressStaticOptions = (app.get('env') !== 'development' || appconfig.settings().overrideStaticCache === true ) ?  {
			maxAge: 86400000
		} : {};
		app.use(express.static(path.resolve(__dirname, '../../public'), expressStaticOptions));
	},
	pageCompression: function () {
		if (appconfig.settings().expressCompression) {
			app.use(compress());
		}
	},
	appLogging: function () {
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
				app.use(expressAppLogger({
					format: 'app'
				}));
			}
			else {
				app.use(expressAppLogger());
			}
		}
	},
	useSessions: function () {
		if (appconfig.settings().sessions.enabled) {
			var express_session_config = {};
			if (appconfig.settings().sessions.type === 'mongo' && appconfig.settings().status !== 'install') {
				express_session_config = {
					secret: 'hjoiuu87go9hui',
					maxAge: new Date(Date.now() + 3600000),
					store: new MongoStore({
						url: database[app.get('env')].url
					})
				};
			}
			else {
				express_session_config = {
					secret: 'hjoiuu87go9hui',
					maxAge: new Date(Date.now() + 3600000)
				};
			}

			app.use(session(express_session_config));
			if (appconfig.settings().crsf) {
				app.use(csrf());
			}
		}
	},
	useLocals: function () {
		app.locals = require('./staticviewhelper');
		app.use(function (req, res, next) {
			app.locals.token = (appconfig.settings().crsf) ? req.csrfToken() : '';
			next();
		});
		app.use(function (req, res, next) {
			app.locals.isLoggedIn = function () {
				return req.user;
			};
			next();
		});
	},
	applicationRouting: function () {
		var periodicObj = {
			express: express,
			app: app,
			logger: logger,
			settings: appconfig.settings(),
			db: db,
			mongoose: mngse
		};
		if (appconfig.settings().status === 'install') {
			require('periodicjs.ext.install')(periodicObj);
		}
		else {
			require('../routes/index')(periodicObj);
		}
	},
	serverStatus: function () {
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
	},
	catchErrors: function () {
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
console.timeEnd('Server Starting');

module.exports.app = app;
module.exports.port = app.get('port');
