/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		upgradeinstall = typeof process.env.npm_config_upgrade_install_periodic ==='string' ||  typeof process.env.npm_config_update ==='string',
		upgradeinstallalias = typeof process.env.npm_config_upgrade ==='string',
		nodemoduleinstall = typeof process.env.npm_config_install_node_module ==='string',
		originalnodemoduleslocation = path.resolve(process.cwd(),'../../node_modules'),
		originallocation = path.resolve(process.cwd(),'../../node_modules','periodicjs'),
		newlocation = path.resolve(process.cwd(),'../../periodicjs'),
		alreadyInstalledDir = false,
		dependenciesInstalledDirCheck = false,
		installeddircheck,
		npmhelper = require('./npmhelper')({
			originalnodemoduleslocation : originalnodemoduleslocation,
			originallocation : originallocation,
			newlocation : newlocation
		});

try{
	installeddircheck = fs.statSync(newlocation,'r');
 	alreadyInstalledDir=true;
}
catch(e){
 	alreadyInstalledDir=false;
}

try{
	installeddircheck = fs.statSync(originallocation,'r');
 	dependenciesInstalledDirCheck=false;
}
catch(e){
 	dependenciesInstalledDirCheck=true;
}

if(process.env.npm_config_skip_post_install){
	console.log('skip post install');
}
else if(dependenciesInstalledDirCheck){
	console.log('skip post install because of dependenciesInstalledDirCheck',dependenciesInstalledDirCheck);
}
else{
	npmhelper.installStandardExtensions(
		function (err) {
			var currentscriptdirarray = process.cwd().split(path.sep);
			if (err) {
				console.error(err);
			}
			else {
				fs.open(originallocation,'r',function(err){
					if(err){
						console.log('Installed Periodicjs Local Dependencies');
						process.exit(0);
					}
					else if(currentscriptdirarray[currentscriptdirarray.length-2]!=='node_modules'){
						console.warn('Already Installed Periodic');
						process.exit(0);
					}
					else if(alreadyInstalledDir){
						console.log('Periodicjs Already Installed, Now Upgrading');
						npmhelper.upgradePeriodic(function(){ 
							npmhelper.moveInstalledPeriodic(); 
						});
					}
					else if(upgradeinstall || upgradeinstallalias){
						console.log('Upgrade Periodicjs');
						npmhelper.upgradePeriodic(function(){ 
							npmhelper.moveInstalledPeriodic(); 
						});
					}
					else if(nodemoduleinstall){
						console.log('Installed Periodicjs');
						process.exit(0);
					}
					else{
						console.log('New Periodicjs Install');
						npmhelper.moveInstalledPeriodic();
					}
				});
			}
		});	
}