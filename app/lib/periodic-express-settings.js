/*
 * periodicjs
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';
console.log("outside of exports");


module.exports = function(app){
	console.log("added settings");
	app.set("addedplugin","word");
	// app.set('view engine', 'ejs');
	// app.set('views', path.resolve(__dirname,'../app/views'));
	// app.use(bodyParser());
	// app.use(cookieParser('optional secret string'));
	// app.use(favicon( path.resolve(__dirname,'../public/favicon.ico') ) );
	// app.engine('html', require('ejs').renderFile);
	// app.engine('ejs', require('ejs').renderFile);
	// app.use(express.static(path.resolve(__dirname,'../public')));
};