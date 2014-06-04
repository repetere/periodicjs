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
	cookieParser = require('cookie-parser'),
	favicon = require('serve-favicon'),
	session = require('express-session'),
	responseTime = require('response-time'),
	compress = require('compression'),
	csrf = require('csurf'),
	ejs = require('ejs'),
	app = express(),
	MongoStore = require('connect-mongo')(session),
	expressAppLogger = require('morgan'),
	appLog = require('../../content/config/logger'),
	config = require('./config'),
	pluginLoader = require('./plugins'),
	appconfig,
	plugins,
	logger,
	database = require('../../content/config/database'),
	db,
	dburl,
	mngse;

//https://github.com/expressjs/csurf
//https://github.com/expressjs/timeout
//https://github.com/expressjs/vhost
//https://github.com/senchalabs/connect/blob/master/Readme.md#middleware

var init = {
	loadConfiguration : function(){
		appconfig = new config();
		if(appconfig.settings().debug){
			console.log(appconfig.settings());
		}
		app.set('port',appconfig.settings().application.port);
		app.set('env',appconfig.settings().application.environment);
		db = database[app.get('env')];
		dburl = db.url;
		mngse =  db.mongoose;
	},
	viewSettings : function(){
		app.set('view engine', 'ejs');
		app.set('views', path.resolve(__dirname,'../views'));
		app.engine('html', require('ejs').renderFile);
		app.engine('ejs', require('ejs').renderFile);
	},
	expressSettings : function(){
		app.use(responseTime(5));
		app.use(bodyParser({ keepExtensions: true, uploadDir: __dirname + '/public/uploads/files' }));
		app.use(cookieParser(appconfig.settings().cookies.cookieParser));
		app.use(favicon( path.resolve(__dirname,'../../public/favicon.ico') ) );
	},
	staticCaching : function(){
		var expressStaticOptions = (app.get('env') !== 'production') ? {} : {maxAge: 86400000};
		app.use(express.static(path.resolve(__dirname,'../../public'),expressStaticOptions));
	},
	pageCompression : function(){
		if(appconfig.settings().expressCompression){
			app.use(compress());
		}
	},
	useLocals : function(){
		app.locals.title = "test title";
		app.locals.testFunction = function(paramvar){
			return 'adding to test func - '+paramvar;
		};
	},
	logErrors : function(){
		logger = new appLog(app.get('env'));

		//log errors
		app.use(function(err, req, res, next){
			logger.error(err.stack);
			next(err);
		});

		//send client errors
		//catch all errors
		app.use(function (err, req, res, next) {
			// console.log("err.name",err.name);
			if (req.xhr) {
				res.send(500, { error: 'Something blew up!' });
			}
			else {
				res.status(500);
				res.render('errors/500', { error: err });
			}
		});
	},
	appLogging : function(){
		if(appconfig.settings().debug){
			expressAppLogger.token('colorstatus', function(req, res){
				var color = 32; // green
				var status = res.statusCode;

				if (status >= 500) {color = 31;} // red
				else if (status >= 400) {color = 33;} // yellow
				else if (status >= 300) {color = 36;} // cyan
				return '\x1b[' + color + 'm'+status+'\x1b[90m';
			});
			expressAppLogger.format('app','\x1b[90m:remote-addr :method :url :colorstatus :response-time ms :date :referrer :user-agent\x1b[0m' );
			app.use(expressAppLogger({format:"app"}));
		}
	},
	applicationRouting : function(){
		require('../routes/index')({express:express,app:app,logger:logger,settings:appconfig.settings(),db:db,mongoose:mngse});
	},
	useSessions: function(){
		if(appconfig.settings().sessions.enabled){
			var express_session_config = {};
			if(appconfig.settings().sessions.type==="mongo"){
				express_session_config = {
					secret:'hjoiuu87go9hui',
					maxAge: new Date(Date.now() + 3600000),
					store: new MongoStore({url:database[app.get('env')].url})
				};
			}
			else{
				express_session_config = {
					secret:'hjoiuu87go9hui',
					maxAge: new Date(Date.now() + 3600000)
				};
			}

			app.use(session(express_session_config));
			if(appconfig.settings().crsf){
				logger.silly('using crsf');
				app.use(csrf());
			}
		}
	},
	serverStatus: function(){
		logger.info('Express server listening on port ' + app.get('port'));
		logger.info('Running in environment: '+app.get('env'));
		logger.silly('looks good.');
	},
	loadPlugins: function(){
		plugins = new pluginLoader(appconfig.settings());
		plugins.loadPlugins({express:express,app:app,logger:logger,settings:appconfig.settings(),db:db,mongoose:mngse});
	}
};

init.logErrors();
init.loadConfiguration();
init.viewSettings();
init.expressSettings();
init.staticCaching();
init.pageCompression();
init.useLocals();
init.appLogging();
init.useSessions();
init.applicationRouting();
init.loadPlugins();
init.serverStatus();


module.exports.app = app;
module.exports.port = app.get('port');