/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		prompt = require('prompt'),
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


prompt.start();
prompt.get(schema, function (err, result) {
  if(err){
		console.error(err);
		process.exit(0);
	}
	else{
		if(result.auto_clean_up.match(/y/gi)){
			// console.log("move",originallocation);
			// console.log("to",newlocation);

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
									console.log("Installed Periodicjs");
									process.exit(0);
								}
							});
						}
					});
				}
			});
		}
		else{
			console.log("Installed Periodicjs");
			process.exit(0);
		}
	}
});		
