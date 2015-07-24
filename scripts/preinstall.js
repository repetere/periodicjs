/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		extensionsConfigPath = path.join(process.cwd(),'content/config/extensions.json');

fs.copy(extensionsConfigPath,extensionsConfigPath+'.backup',function(err){
	if(err){
		console.log('copying extensions.json backup error',err);
	}
	else{
		console.log('created extensions.json backup');
	}
	process.exit(0);
});