/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		Utilities = require('periodicjs.core.utilities'),
		CoreUtilities = new Utilities({}),
		nodemodulespath = path.resolve(process.cwd(),'node_modules'),
		npm = require('npm');

fs.readdir(nodemodulespath,function(err,files){
	if(err){
		throw new Error(err);
	}
	else{
		console.log('files',files);
	}
});

// npm.load({
// 	'strict-ssl': false,
// 	'production': true,
// 	'skip-install-periodic-ext': true
// },function (err) {
// 	if (err) {
// 		console.error(err);
// 	}
// 	else {
// 		npm.commands.install([
// 			'periodicjs.ext.admin@1.8.5',
// 			'periodicjs.ext.dbseed@1.5.3',
// 			'periodicjs.ext.default_routes@1.5.3',
// 			'periodicjs.ext.install@1.5.3',
// 			'periodicjs.ext.login@1.5.4',
// 			'periodicjs.ext.mailer@1.5.3',
// 			'periodicjs.ext.scheduled_content@1.5.2',
// 			'periodicjs.ext.user_access_control@1.5.4',
// 			],
// 		function (err 
// 			//,data
// 			) {
// 			if (err) {
// 				console.error(err);
// 			}
// 			else {
// 				console.log('installed missing extensions');
// 				CoreUtilities.run_cmd( 'pm2', ['restart','periodicjs'], function(text) { 
// 					console.log (text);
// 					process.exit(0);
// 				});	
// 			}
// 		});	
// 		npm.on('log', function (message) {
// 			console.log(message);
// 		});
// 	}
// });