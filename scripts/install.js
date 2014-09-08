/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		commandprompt = require('prompt'),
		npm = require('npm'),
		originalnodemoduleslocation = path.resolve(process.cwd(),'../../node_modules'),
		originallocation = path.resolve(process.cwd(),'../../node_modules','periodicjs'),
		newlocation = path.resolve(process.cwd(),'../../periodicjs'),
		schema = {
	    properties: {
	      auto_clean_up: {
	        message: 'Do you want to remove node_modules and copy periodicjs to site root? (Yes or No)',
	        required: true
	      }
	    }
	  };

npm.load({
	'strict-ssl': false,
	'production': true,
	'skip-install-periodic-ext': true,
},function (err) {
	if (err) {
		console.error(err);
	}
	else {
		npm.commands.install([
			'periodicjs.ext.admin@1.5.21',
			'periodicjs.ext.dbseed@1.5.2',
			'periodicjs.ext.default_routes@1.5.2',
			'periodicjs.ext.install@1.5.2',
			'periodicjs.ext.login@1.5.21',
			'periodicjs.ext.mailer@1.5.22',
			'periodicjs.ext.scheduled_content@1.5.2',
			'periodicjs.ext.user_access_control@1.5.2',
			],
		function (err 
			//,data
			) {
			if (err) {
				console.error(err);
			}
			else {
				// console.log(data);

				fs.open(originallocation,'r',function(err){
					if(err){
						console.log('Installed Periodicjs');
						process.exit(0);
					}
					else{
						console.log('\u0007');
						commandprompt.start();
						commandprompt.get(schema, function (err, result) {
						  if(err){
								console.error(err);
								process.exit(0);
							}
							else{
								if(result.auto_clean_up.match(/y/gi)){

									fs.ensureDir(newlocation,function(err){
										if(err){
											console.error(err);
											process.exit(0);
										}
										else{
											fs.copy(
												originallocation,
												newlocation,
												function(err){
												if(err){
													console.error(err);
													console.log(err.stack);
													process.exit(0);
												}
												else{
													fs.remove(originalnodemoduleslocation, function(err){
														if(err){
															console.error(err);
															console.log(err.stack);
															process.exit(0);
														}
														else{	
															console.log('Installed Periodicjs');
															process.exit(0);
														}
													});
												}
											});
										}
									});
								}
								else{
									console.log('Installed Periodicjs');
									process.exit(0);
								}
							}
						});
					}
				});
			}
		});	
		npm.on('log', function (message) {
			console.log(message);
		});
	}
});