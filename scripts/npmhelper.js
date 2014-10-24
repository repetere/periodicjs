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
		npm = require('npm'),
		upgradeinstall = typeof process.env.npm_config_upgrade_install_periodic ==='string' ||  typeof process.env.npm_config_update ==='string',
		upgradeinstallalias = typeof process.env.npm_config_upgrade ==='string',
		originalnodemoduleslocation,
		originallocation,
		newlocation = path.resolve(process.cwd(),'../../periodicjs'),
		standardExtensions = [
			'periodicjs.ext.admin@1.90.495',
			'periodicjs.ext.dbseed@1.90.5',
			'periodicjs.ext.default_routes@1.90.26',
			'periodicjs.ext.install@1.90.26',
			'periodicjs.ext.login@1.90.26',
			'periodicjs.ext.mailer@1.90.26',
			'periodicjs.ext.scheduled_content@1.90.26',
			'periodicjs.ext.user_access_control@1.90.26',
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

		var updatedExtensionJsonFile = path.join(originallocation,'content/extensions/extensions.json'),
		updatedPeriodicjsExtJson = fs.readJSONSync(updatedExtensionJsonFile),
		currentExtensionJsonFile = path.resolve(newlocation,'content/extensions/extensions.json'),
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
		fs.removeSync(path.join(originallocation,'content/config/deployment')); 
		fs.removeSync(path.join(originallocation,'content/config/process')); 
		fs.removeSync(path.join(originallocation,'content/config/config.json')); 
		fs.removeSync(path.join(originallocation,'content/config/database.js')); 
		fs.removeSync(path.join(originallocation,'public/uploads/files')); 
		// fs.removeSync(path.join(originallocation,'content/extensions/extensions.json'));  
		fs.removeSync(path.join(originallocation,'processes'));  
		fs.removeSync(path.join(originallocation,'logs'));  

		// moveInstalledPeriodic();
		callback(); 
};

var installStandardExtensions = function(callback){
	var npmconfig ={
		'strict-ssl': false,
		'save-optional': true,
		'production': true
	};

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
};

var npmhelper = function(options){
	originalnodemoduleslocation = options.originalnodemoduleslocation;
	originallocation = options.originallocation;
	newlocation = options.newlocation;

	return {
		standardExtensions:standardExtensions,
		installStandardExtensions:installStandardExtensions,
		upgradePeriodic:upgradePeriodic,
		moveInstalledPeriodic:moveInstalledPeriodic
	};
};

module.exports =npmhelper;