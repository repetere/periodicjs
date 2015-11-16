/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs'),
		path = require('path'),
		extensionsConfigPath = path.join(process.cwd(),'content/config/extensions.json');

// console.log('preinstall.js process.cwd()',process.cwd());
// console.log('preinstall.js __dirname',__dirname);
// console.log('preinstall.js extensionsConfigPath',extensionsConfigPath);

fs.readFile(extensionsConfigPath,{encoding :'utf8'},function(err,filedata){
	if(err){
		console.log('reading extensions.json backup error',err);
		process.exit(0);
	}
	else{
		fs.writeFile(extensionsConfigPath+'.dat',filedata,function(err){
			if(err){
				console.log('writing extensions.json.dat backup error',err);
			}
			else{
				console.log('created extensions.json backup');
			}
			process.exit(0);
		});
	}
});