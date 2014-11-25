/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */
// install as module // $ npm install periodicjs@latest --install-node-module
// default install // $ npm install periodicjs@latest 
// upgrade // $ npm install periodicjs@latest --upgrade
// upgrade // $ npm install periodicjs@latest --upgrade-install-periodic

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		Utilities = require('periodicjs.core.utilities'),
		CoreUtilities = new Utilities({}),
		Extensions = require('periodicjs.core.extensions'),
		CoreExtensions = new Extensions({}),
		npm = require('npm'),
		upgradeinstall = typeof process.env.npm_config_upgrade_install_periodic ==='string' ||  typeof process.env.npm_config_update ==='string',
		upgradeinstallalias = typeof process.env.npm_config_upgrade ==='string',
		originalnodemoduleslocation,
		originallocation,
		newlocation = path.resolve(process.cwd(),'../../periodicjs'),
		standardExtensions = [
			'periodicjs.ext.admin@3.1.1',
			'periodicjs.ext.cache@3.1.1',
			'periodicjs.ext.dbseed@3.1.1',
			'periodicjs.ext.default_routes@3.1.1',
			'periodicjs.ext.install@3.1.2',
			'periodicjs.ext.login@3.1.2',
			'periodicjs.ext.mailer@3.1.1',
			'periodicjs.ext.scheduled_content@3.1.1',
			'periodicjs.ext.user_access_control@3.1.1',
		];

var moveInstalledPeriodic = function(){
	fs.copySync(path.join(originallocation,'.npmignore'),path.join(originallocation,'.gitignore'));  
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
							if(upgradeinstall || upgradeinstallalias){
								console.log('Restart to upgrade Periodicjs');
								console.log('\u0007');
								CoreUtilities.run_cmd( 'pm2', ['stop','periodicjs'], function(text) { 
									console.log (text);
									CoreUtilities.run_cmd( 'pm2', ['restart','periodicjs'], function(text) { 
										console.log (text);
										process.exit(0);
									});	
								});
							}
						}
					});
				}
			});
		}
	});
};

var upgradePeriodic = function(callback){

	var updatedExtensionJsonFile = path.join(originallocation,'content/config/extensions.json'),
	updatedPeriodicjsExtJson = fs.readJSONSync(updatedExtensionJsonFile),
	currentExtensionJsonFile = path.resolve(newlocation,'content/config/extensions.json'),
	currentPeriodicjsExtJson = fs.readJSONSync(currentExtensionJsonFile),
	current_ext_admin,
	current_ext_dbseed,
	current_ext_default_routes,
	current_ext_install,
	current_ext_login,
	current_ext_mailer,
	current_ext_scheduled_content,
	current_ext_user_access_control,
	mergedPeriodicExtJson={
		extensions:[]
	};

	for(var x in currentPeriodicjsExtJson.extensions){
		switch(currentPeriodicjsExtJson.extensions[x].name){
			case 'periodicjs.ext.admin':
				current_ext_admin = currentPeriodicjsExtJson.extensions[x];
				break;
			case 'periodicjs.ext.dbseed':
				current_ext_dbseed = currentPeriodicjsExtJson.extensions[x];
				break;
			case 'periodicjs.ext.default_routes':
				current_ext_default_routes = currentPeriodicjsExtJson.extensions[x];
				break;
			case 'periodicjs.ext.install':
				current_ext_install = currentPeriodicjsExtJson.extensions[x];
				break;
			case 'periodicjs.ext.login':
				current_ext_login = currentPeriodicjsExtJson.extensions[x];
				break;
			case 'periodicjs.ext.mailer':
				current_ext_mailer = currentPeriodicjsExtJson.extensions[x];
				break;
			case 'periodicjs.ext.scheduled_content':
				current_ext_scheduled_content = currentPeriodicjsExtJson.extensions[x];
				break;
			case 'periodicjs.ext.user_access_control':
				current_ext_user_access_control = currentPeriodicjsExtJson.extensions[x];
				break;
		}
	}

	for(var y in updatedPeriodicjsExtJson.extensions){
		switch(updatedPeriodicjsExtJson.extensions[y].name){
			case 'periodicjs.ext.admin':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_admin) ? current_ext_admin.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
			case 'periodicjs.ext.dbseed':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_dbseed) ? current_ext_dbseed.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
			case 'periodicjs.ext.default_routes':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_default_routes) ? current_ext_default_routes.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
			case 'periodicjs.ext.install':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_install) ? current_ext_install.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
			case 'periodicjs.ext.login':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_login) ? current_ext_login.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
			case 'periodicjs.ext.mailer':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_mailer) ? current_ext_mailer.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
			case 'periodicjs.ext.scheduled_content':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_scheduled_content) ? current_ext_scheduled_content.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
			case 'periodicjs.ext.user_access_control':
				updatedPeriodicjsExtJson.extensions[y].enabled = (current_ext_user_access_control) ? current_ext_user_access_control.enabled : updatedPeriodicjsExtJson.extensions[y].enabled;
				break;
		}
	}

	// console.log('updatedPeriodicjsExtJson',updatedPeriodicjsExtJson);
	// console.log('currentPeriodicjsExtJson',currentPeriodicjsExtJson);
	// mergedPeriodicExtJson = merge(currentPeriodicjsExtJson, updatedPeriodicjsExtJson);

	if(currentPeriodicjsExtJson && currentPeriodicjsExtJson.extensions && currentPeriodicjsExtJson.extensions.length>0){
		mergedPeriodicExtJson = currentPeriodicjsExtJson;
		for(var a in mergedPeriodicExtJson.extensions){
			for(var b in updatedPeriodicjsExtJson.extensions){
				if(mergedPeriodicExtJson.extensions[a].name === updatedPeriodicjsExtJson.extensions[b].name){
					mergedPeriodicExtJson.extensions[a] = updatedPeriodicjsExtJson.extensions[b];
				}
			}
		}	
		// console.log('mergedPeriodicExtJson',mergedPeriodicExtJson);
		fs.writeJSONSync(updatedExtensionJsonFile,mergedPeriodicExtJson);
	}


	fs.removeSync(path.join(originallocation,'content/config/environment')); 
	fs.removeSync(path.join(originallocation,'content/config/extensions')); 
	fs.removeSync(path.join(originallocation,'content/config/themes')); 
	fs.removeSync(path.join(originallocation,'content/config/deployment')); 
	fs.removeSync(path.join(originallocation,'content/config/process')); 
	fs.removeSync(path.join(originallocation,'content/config/config.json')); 
	fs.removeSync(path.join(originallocation,'content/config/database.js')); 
	fs.removeSync(path.join(originallocation,'content/config/logger.js')); 
	fs.removeSync(path.join(originallocation,'content/config/startup.js')); 
	fs.removeSync(path.join(originallocation,'public/uploads/files')); 
	// fs.removeSync(path.join(originallocation,'content/config/extensions.json'));  
	fs.removeSync(path.join(originallocation,'processes'));  
	fs.removeSync(path.join(originallocation,'logs'));  

	// moveInstalledPeriodic();
	callback(); 
};

var installCustomConfigNodeModules = function(callback){
	var currentConfig = fs.readJSONSync(path.resolve(process.cwd(),'content/config/config.json')),
		npmconfig ={
			'strict-ssl': false,
			'save-optional': true,
			'production': true
		};

	if(currentConfig && currentConfig.node_modules && Array.isArray(currentConfig.node_modules)  && currentConfig.node_modules.length >0 ){
	 	npm['save-optional'] = true;
		//console.log('install these modules',currentConfig.node_modules)
		npm.load(
			npmconfig,
			function (err) {
			if (err) {
				console.error(err);
				callback(err);
			}
			else {
			 	npm['save-optional'] = true;
				npm.commands.install(
					currentConfig.node_modules,
					callback
				);
			}
		});
	}
	else{
		callback(null,'no custom node modules');
	}
};

var installStandardExtensions = function(callback){
	var npmconfig ={
		'strict-ssl': false,
		'save-optional': true,
		'production': true
	},
	configfile = path.resolve(newlocation,'content/config/config.json'),
	currentConfig;
	fs.readJSON(configfile,function(readconfigerr,configjson){
		if(readconfigerr){
			console.log('no existing config json');
		}
		if(configjson){
			currentConfig = configjson;
			if(currentConfig && currentConfig.node_modules && Array.isArray(currentConfig.node_modules) ){
				standardExtensions = standardExtensions.concat(currentConfig.node_modules);
			}
		}
		npm.load(
			npmconfig,
			function (err) {
			if (err) {
				console.error(err);
				callback(err);
			}
			else {
			 	npm['save-optional'] = true;
				npm.commands.install(
					standardExtensions,
					callback
				);
			}
		});
	});
};

/** 
 * @description get list of installed extensions to test against extensions.json to see if during deployment, new extensions were added, if so, then install them
 */
var getInstalledExtensions = function(callback){
	npm.load({
		'strict-ssl': false,
		'production': true,
		'no-optional': true,
		'quiet': true,
		'silent': true,
		'json': true,
		'depth': 0,
		'skip_post_install':true,
		'prefix':process.cwd(),
		// 'skip-install-periodic-ext': true
	},function (err) {
		if (err) {
			callback(err,null);
		}
		else {
		 	npm['no-optional'] = true;
		 	npm.skip_post_install = true;
		 	npm.silent = true;
		 	npm.quiet = true;
			npm.commands.list([],
			function (err,data) {
				var installedmod =[];
				for(var x in data.dependencies){
					if(data.dependencies[x].name && data.dependencies[x].name.match(/periodicjs.ext/gi)){
						installedmod.push(data.dependencies[x].name+'@'+data.dependencies[x].version);					
					}
				}
				console.log('installedmod',installedmod);
				callback(null,installedmod);
			});	
		}
	});
};

var getMissingExtensionsFromConfig = function(installedExtensions,callback){
	/** 
	 * compare installed extensions with extension from conf
	 * @param  {array} installedExtensions   array of extensions installed in node modules
	 * @param  {array} allExtensionsFromConf array of extension objects from extensions.json
	 * @return {array}                       list of npm modules to install from missing extension list
	 */
	var getMissingExtensions = function(installedExtensions,allExtensionsFromConf){
		var installedExtensionsFromConf=[],
			missingExtensionsInstallList=[];

		if(installedExtensions && installedExtensions.length>0 && allExtensionsFromConf && allExtensionsFromConf.length>0){
			for(var y in installedExtensions){
				for(var z in allExtensionsFromConf){
					if(installedExtensions[y]===allExtensionsFromConf[z].name+'@'+allExtensionsFromConf[z].version){
						/**
						 * remove items from array that are in the array list of installed module, put the removed item in an array of objects that have already been installed, the resulting array will have removed installed extensions
						 */
						installedExtensionsFromConf.push(allExtensionsFromConf.splice(z,1)[0]);
					}
				}
			}	
		}

		/**
		 * if the extension is private or is installed from a custom github repo, and it's defined in the ext conf, then use that install otherwise install from npm
		 */
		if(allExtensionsFromConf && allExtensionsFromConf.length>0){
			for(var a in allExtensionsFromConf){
				if(allExtensionsFromConf[a].periodicConfig && allExtensionsFromConf[a].periodicConfig.customGitNPMInstall ){
					missingExtensionsInstallList.push(allExtensionsFromConf[a].periodicConfig.customGitNPMInstall);
				}
				else{
					missingExtensionsInstallList.push(allExtensionsFromConf[a].name+'@'+allExtensionsFromConf[a].version);
				}
			}
		}
		return missingExtensionsInstallList;
	},
	missingExtensions=[];


	CoreExtensions.getExtensions(null,function(err,currentextensions){
		if(err){
			callback(err,null);
		}
		else{
			missingExtensions = getMissingExtensions(installedExtensions,currentextensions);
			console.log('missingExtensions',missingExtensions);		
			callback(null,missingExtensions);
		}
	});
};

var installMissingExtensions = function(missingExtensions,callback){
	if(missingExtensions && missingExtensions.length>0){
		npm.load({
			'strict-ssl': false,
			'production': true,
			'silent': true,
			'save-optional': true
			// 'skip_ext_conf': true
		},function (err) {
			if (err) {
				callback(err,null);
			}
			else {
			 	npm['save-optional'] = true;
			 	npm.silent = true;
			 	npm.quiet = true;
				npm.commands.install(missingExtensions,
				function (err 
					//,data
					) {
					if (err) {
						callback(err,null);
					}
					else {
						callback(null,'installed missing extensions',missingExtensions);
					}
				});	
				//npm.on('log', function (message) {
				//	console.log(message);
				//});
			}
		});
	}
	else{
		callback(null,'no extensions to install',missingExtensions);
	}
};

var installMissingNodeModules = function(missingExtensionStatus,missingExtensions,callback){
	installCustomConfigNodeModules(function(err,customcallbackstatus){
		if(err){
			callback(err);
		}
		else{
			console.log('customcallbackstatus',customcallbackstatus);
			console.log('missingExtensionStatus',missingExtensionStatus);
			npm.load({
				'strict-ssl': false,
				'production': true,
				'silent': true,
				'no-optional': true,
				'save-optional': false,
				'skip_post_install':true,
				'skip_ext_conf': true
			},function (err) {
				if (err) {
					callback(err,null);
				}
				else {
				 	npm['no-optional'] = true;
				 	npm['save-optional'] = false;
				 	npm.silent = true;
				 	npm.skip_post_install = true;
				 	npm.quiet = true;
				 	//console.log('npm',npm);
					npm.commands.install([],
					function (err 
						//,data
						) {
						if (err) {
							callback(err,null);
						}
						else {
							callback(null,missingExtensions);
						}
					});	
					//npm.on('log', function (message) {
					//	console.log(message);
					//});
				}
			});

		}
	});
};

var getThemeName = function(missingExtensionResult,callback){
	var themename;
	fs.readJSON(path.resolve(process.cwd(),'content/config/config.json'),function(err,confJSON){
		if(err){
			console.log('install theme modules err',err);
			callback(null,missingExtensionResult,null);
		}
		else if(confJSON && confJSON.theme){
			themename = confJSON.theme;
			callback(null,missingExtensionResult,themename);
		}
		else{
			callback(null,missingExtensionResult,null);
		}
	});
};

var installThemeModules = function(missingExtensionResult,themename,callback){
	if(themename){
		var themedir = path.resolve('content/themes',themename);
		fs.open(path.join(themedir,'package.json'),'r',function(err){
			if(err){
				callback(null,missingExtensionResult,'no package.json in theme');
			}
			else{
				npm.load({
					'prefix':themedir,
					'strict-ssl': false,
					'silent': true,
					'production': true
				},function (err,npm) {
				 	npm.prefix = themedir;
				 	npm.silent = true;
				 	npm.quiet = true;

					if (err) {
						console.log('install theme npm modules err',err);
						callback(null,missingExtensionResult);
					}
					else {
						npm.commands.install([themedir],
						function (err) {
							console.log('theme npm install err',err,themedir);
							callback(null,missingExtensionResult,'installed theme node modules');
						});	
					}
				});
			}
		});
	}
	else{
		callback(null,missingExtensionResult,'no config.json for theme module install');
	}
};

var npmhelper = function(options){
	originalnodemoduleslocation = options.originalnodemoduleslocation;
	originallocation = options.originallocation;
	newlocation = options.newlocation;

	return {
		standardExtensions:standardExtensions,
		installStandardExtensions:installStandardExtensions,
		upgradePeriodic:upgradePeriodic,
		moveInstalledPeriodic:moveInstalledPeriodic,
		getInstalledExtensions: getInstalledExtensions,
		getMissingExtensionsFromConfig: getMissingExtensionsFromConfig,
		installMissingExtensions: installMissingExtensions,
		installMissingNodeModules: installMissingNodeModules,
		installCustomConfigNodeModules: installCustomConfigNodeModules,
		getThemeName: getThemeName,
		installThemeModules: installThemeModules
	};
};

module.exports =npmhelper;