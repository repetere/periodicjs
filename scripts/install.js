/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		async = require('async'),
 		Utilities = require('periodicjs.core.utilities'),
		CoreUtilities = new Utilities({}),
		npmhelper = require('./npmhelper')({}),
		extensionsConfigPath = path.join(process.cwd(),'/content/config/extensions.json'),
		applicationConfigPath = path.join(process.cwd(),'/content/config/config.json'),
		appContentPath = path.join(process.cwd(),'/content/'),	
		appContentPathBackupDir = path.join(process.cwd(),'../periodic_content_backup/'),
		publicPath = path.join(process.cwd(),'/public/'),	
		publicPathBackupDir = path.join(process.cwd(),'../periodic_public_backup/'),
		customFilesPath = path.join(process.cwd()),	
		customFilesPathBackupDir = path.join(process.cwd(),'../periodic_customfiles_backup/'),
		extensionConfig,
		applicationConfig,
		backupDir,
		alreadyInstalled= false;



// console.log('install.js process.cwd()',process.cwd());
// console.log('install.js __dirname',__dirname);
// console.log('install.js extensionsConfigPath',extensionsConfigPath);
// console.log('install.js applicationConfigPath',applicationConfigPath);
// console.log('install.js appContentPath',appContentPath);
// console.log('install.js appContentPathBackupDir',appContentPathBackupDir);
// console.log('install.js publicPath',publicPath);
// console.log('install.js publicPathBackupDir',publicPathBackupDir);
try{
	backupDir = fs.statSync(publicPathBackupDir);
	alreadyInstalled = true;
}
catch(e){
	console.log('there is no backup dir',publicPathBackupDir);
}

try{
	extensionConfig = fs.readJsonSync(extensionsConfigPath);
	applicationConfig = fs.readJsonSync(applicationConfigPath);
	if(alreadyInstalled || extensionConfig.extensions.length>0){
	 	alreadyInstalled=true;
	}
	else if(alreadyInstalled ||applicationConfig.status==='active'){
	 	alreadyInstalled=true;
	}
}
catch(e){
 	alreadyInstalled=false;
}

var restoreExtensionBackup = function(){
	async.parallel({
			copy_content:	function(asyncCB){
				fs.copy( appContentPathBackupDir,appContentPath,function(err){
					if(err){
						asyncCB(err);
					}
					else{
						fs.remove(appContentPathBackupDir,asyncCB);
					}
				});
			},
			copy_public:	function(asyncCB){
				fs.copy(publicPathBackupDir,publicPath, function(err){
					if(err){
						asyncCB(err);
					}
					else{
						fs.remove(publicPathBackupDir,asyncCB);
					}
				});
			},
			copy_custom_files:	function(asyncCB){
				fs.copy(customFilesPathBackupDir,customFilesPath, function(err){
					if(err){
						asyncCB(err);
					}
					else{
						fs.remove(customFilesPathBackupDir,asyncCB);
					}
				});
			}
		},function(err,result){
		  if (err){
				console.log('copying appContentPathBackupDir & publicPathBackupDir backup error',err);
			}
			else{
				console.log('successful appContentPathBackupDir & publicPathBackupDir backup',result);
			}
			process.exit(0);
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
	//deploy sync
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
				console.log('post install deploysync result',result);
				CoreUtilities.restart_app({});
			}
	});
}
else {
	fs.copy(path.join(__dirname,'../.npmignore'), path.join(__dirname,'../.gitignore'), function (err) {
	  if (err) {return console.error(err);}
	  console.log('copied ignore file!');
	}); // copies file
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
fs.ensureDir(path.join(__dirname,'../logs'), function (err) {
	if(err){
	  console.log('creating log directory err',err); // => null
	}
});