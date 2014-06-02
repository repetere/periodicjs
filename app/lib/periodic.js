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
	ejs = require('ejs'),
	app = express(),
	expressAppLogger = require('morgan'),
	config = require('./config'),
	appconfig;

//https://github.com/expressjs/csurf
//https://github.com/expressjs/compression
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
		app.use(cookieParser('optional secret string'));
		app.use(favicon( path.resolve(__dirname,'../../public/favicon.ico') ) );
	},
	staticCaching : function(){
		if(app.get('env') !== 'production'){
			app.use(express.static(path.resolve(__dirname,'../../public')));
		}
		else{
			app.use(express.static(path.resolve(__dirname,'../../public'),{maxAge: 86400000}));
		}
	},
	userAuth : function(){

	},
	pageCaching : function(){
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
	useCSRF : function(){

	},
	logErrors : function(){
		app.use(function(req,res,next){
			console.log('%s %s',req.method,req.url);
			next();
		});
	},
	appLogging : function(){
		app.use(expressAppLogger({ format: 'dev', immediate: true }));
	},
	applicationRouting : function(){
		app.get('*',function(req,res){
			console.log("got it");
			res.render('home/index',{randomdata:'twerkin'});
		});
	},
	serverStatus: function(){
		console.log('Express server listening on port ' + app.get('port'));
		console.log('Running in environment: '+app.get('env'));
		// expressAppLogger.logger('looks good');
	}
};

init.loadConfiguration();
init.viewSettings();
init.expressSettings();
init.staticCaching();
init.pageCaching();
init.useLocals();
init.logErrors();
init.applicationRouting();
init.serverStatus();


module.exports.app = app;
module.exports.port = app.get('port');