/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var async = require('async'),
 		Utilities = require('periodicjs.core.utilities'),
		CoreUtilities = new Utilities({}),
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
			CoreUtilities.restart_app({});
		}
});
