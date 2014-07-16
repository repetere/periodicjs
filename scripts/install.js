/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path');
fs.move(path.resolve(process.cwd(),'node_modules','periodicjs'),path.resolve(process.cwd(),'periodicjs'),function(err){
	if(err){
		console.error(err);
		process.exit(0);
	}
	else{
		console.log("Installed Periodicjs");
		process.exit(0);
	}
});