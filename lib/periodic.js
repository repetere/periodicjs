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
 * @requires classie
 * @requires util-extend
 * @requires domhelper
 * @requires events
 * @requires platterjs
 * @requires ribbonjs
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
	config = {"samplesettings":"probtrue"};
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname,'../app/views'));
app.use(bodyParser());
app.use(cookieParser('optional secret string'));
app.use(favicon( path.resolve(__dirname,'../public/favicon.ico') ) );
app.engine('html', require('ejs').renderFile);
app.engine('ejs', require('ejs').renderFile);
app.use(express.static(path.resolve(__dirname,'../public')));

require('./periodic-express-settings');

app.use(function(req,res,next){
	console.log('%s %s',req.method,req.url);
	next();
});

app.get('*',function(req,res){
	console.log("got it");
	res.render('home/index',{randomdata:'twerkin'});
});

module.exports = app;