/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		npmhelper = require('./npmhelper'),
		extensionsConfigPath = path.join(process.cwd(),'content/config/extensions.json'),
		applicationConfigPath = path.join(process.cwd(),'content/config/config.json'),
		extensionConfig,
		applicationConfig,
		alreadyInstalled= false;

try{
	extensionConfig = fs.readJsonSync(extensionsConfigPath);
	applicationConfig = fs.readJsonSync(applicationConfigPath);
	if(extensionConfig.extensions.length>0){
	 	alreadyInstalled=true;
	}
	else if(applicationConfig.status==='active'){
	 	alreadyInstalled=true;
	}
}
catch(e){
 	alreadyInstalled=false;
}

var restoreExtensionBackup = function(){
	fs.readFile(extensionsConfigPath+'.dat',{encoding :'utf8'},function(err,filedata){
		if(err){
			console.log('restoring extensions.json.dat error',err);
			process.exit(0);
		}
		else{
			fs.writeFile(extensionsConfigPath,filedata,function(err){
				if(err){
					console.log('writing extensions.json from backup .dat error',err);
				}
				else{
					console.log('restored extensions.json');
				}
				process.exit(0);
			});
		}
	});
};

console.log('alreadyInstalled',alreadyInstalled);
if(process.env.npm_config_skip_post_install){
	console.log('skip post install');
	restoreExtensionBackup();
}
else if(alreadyInstalled){
	console.log('Periodicjs Already Installed, Upgrade Complete');
	restoreExtensionBackup();
}
else {
	npmhelper.cleanInstallStandardExtensions(
		{},
		function (err) {
			if (err) {
				console.error(err);
				process.exit(0);
			}
			else {
				console.log('Upgraded Periodicjs');
				process.exit(0);
			}
		});	
}