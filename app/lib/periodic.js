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
	ejs = require('ejs'),
	app = express(),
	expressAppLogger = require('morgan'),
	config = {"samplesettings":"probtrue"};

//https://github.com/expressjs/csurf
//https://github.com/expressjs/response-time
//https://github.com/expressjs/compression
//https://github.com/expressjs/timeout
//https://github.com/expressjs/vhost
//https://github.com/senchalabs/connect/blob/master/Readme.md#middleware

var init = {
	viewSettings : function(){
		app.set('view engine', 'ejs');
		app.set('views', path.resolve(__dirname,'../views'));
		app.engine('html', require('ejs').renderFile);
		app.engine('ejs', require('ejs').renderFile);
	},
	expressSettings : function(){
		app.use(bodyParser({ keepExtensions: true, uploadDir: __dirname + '/public/uploads/files' }));
		app.use(cookieParser('optional secret string'));
		app.use(favicon( path.resolve(__dirname,'../../public/favicon.ico') ) );
	},
	staticCaching : function(){
		app.use(express.static(path.resolve(__dirname,'../../public')));
	},
	userAuth : function(){

	},
	pageCaching : function(){
//use compression
// app.use(express.compress());
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
		app.use(expressAppLogger());
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
		expressAppLogger.info('looks good');
	}
};

init.viewSettings();
init.expressSettings();
init.staticCaching();
init.useLocals();
init.logErrors();
init.applicationRouting();


module.exports.app = app;
module.exports.port = 8080;