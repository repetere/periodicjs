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
		npm = require('npm');
/** 
 * @description get list of installed extensions to test against extensions.json to see if during deployment, new extensions were added, if so, then install them
 */
var getInstalledExtensions = function(callback){
	npm.load({
		'strict-ssl': false,
		'production': true,
		'json': true,
		'depth': 0,
		'prefix':process.cwd(),
		'skip-install-periodic-ext': true
	},function (err) {
		if (err) {
			callback(err,null);
		}
		else {
			npm.commands.list([],
			function (err,data) {
				var installedmod =[];
				for(var x in data.dependencies){
					if(data.dependencies[x].name && data.dependencies[x].name.match(/periodicjs.ext/gi)){
						installedmod.push(data.dependencies[x].name+'@'+data.dependencies[x].version);					
					}
				}
				// console.log('installedmod',installedmod);
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
			// console.log('missingExtensions',missingExtensions);		
			callback(null,missingExtensions);
		}
	});
};

var installMissingExtensions = function(missingExtensions,callback){
	if(missingExtensions && missingExtensions.length>0){
		npm.load({
			'strict-ssl': false,
			'production': true,
			'skip-install-periodic-ext': true
		},function (err) {
			if (err) {
				callback(err,null);
			}
			else {
				npm.commands.install(missingExtensions,
				function (err 
					//,data
					) {
					if (err) {
						callback(err,null);
					}
					else {
						callback(null,'installed missing extensions');
					}
				});	
				npm.on('log', function (message) {
					console.log(message);
				});
			}
		});
	}
	else{
		callback(null,'no extensions to install');
	}
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
		npm.load({
			'prefix':themedir,
			'strict-ssl': false,
			'production': true
		},function (err,npm) {
		 	npm.prefix = themedir;

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
	else{
		callback(null,missingExtensionResult,'no config.json for theme module install');
	}
};

async.waterfall([
	getInstalledExtensions,
	getMissingExtensionsFromConfig,
	installMissingExtensions,
	getThemeName,
	installThemeModules
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
