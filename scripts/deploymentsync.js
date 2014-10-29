/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var async = require('async'),
 		fs = require('fs-extra'),
 		path = require('path'),
 		Utilities = require('periodicjs.core.utilities'),
		CoreUtilities = new Utilities({}),
		Extensions = require('periodicjs.core.extensions'),
		CoreExtensions = new Extensions({}),
		npm = require('npm'),
		npmhelper = require('./npmhelper')({});

async.waterfall([
	npmhelper.getInstalledExtensions,
	npmhelper.getMissingExtensionsFromConfig,
	npmhelper.installMissingExtensions,
	npmhelper.installMissingNodeModules,
	npmhelper.getThemeName,
	npmhelper.installThemeModules
	],
	function(err,result){	
		if(err){
			throw new Error(err);
		}
		else{
			console.log('deployment sync result',result);
			CoreUtilities.run_cmd( 'pm2', ['restart','periodicjs'], function(text) { 
				console.log (text);
				process.exit(0);
			});		
		}
});
