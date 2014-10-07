/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		// commandprompt = require('prompt'),
		merge = require('utils-merge'),
		Utilities = require('periodicjs.core.utilities'),
		CoreUtilities = new Utilities({}),
		npm = require('npm'),
		upgradeinstall = typeof process.env.npm_config_upgrade_install_periodic ==='string',
		upgradeinstallalias = typeof process.env.npm_config_upgrade ==='string',
		nodemoduleinstall = typeof process.env.npm_config_install_node_module ==='string',
		originalnodemoduleslocation = path.resolve(process.cwd(),'../../node_modules'),
		originallocation = path.resolve(process.cwd(),'../../node_modules','periodicjs'),
		newlocation = path.resolve(process.cwd(),'../../periodicjs')//,
		// schema = {
	 //    properties: {
	 //      auto_clean_up: {
	 //        message: 'Do you want to remove node_modules and copy periodicjs to site root? (Yes or No)',
	 //        required: true
	 //      }
	 //    }
	 //  }
	  ;

// install as module // $ npm install periodicjs@latest --install-node-module
// default install // $ npm install periodicjs@latest 
// upgrade // $ npm install periodicjs@latest --upgrade
// upgrade // $ npm install periodicjs@latest --upgrade-install-periodic

var moveInstalledPeriodic = function(){
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
								CoreUtilities.run_cmd( 'pm2', ['restart','periodicjs'], function(text) { 
									console.log (text);
									process.exit(0);
								});	
							}
						}
					});
				}
			});
		}
	});
};

var upgradePeriodic = function(){
	CoreUtilities.run_cmd( 'pm2', ['stop','periodicjs'], function(text) { 
		console.log (text);

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
		mergedPeriodicExtJson;

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
		// console.log('current_ext_admin',current_ext_admin);
		mergedPeriodicExtJson = merge(currentPeriodicjsExtJson, updatedPeriodicjsExtJson);
		fs.writeJSONSync(updatedExtensionJsonFile,mergedPeriodicExtJson);

		fs.removeSync(path.join(originallocation,'content/config/environment')); 
		fs.removeSync(path.join(originallocation,'content/config/extensions')); 
		fs.removeSync(path.join(originallocation,'content/config/process')); 
		fs.removeSync(path.join(originallocation,'content/config/config.json')); 
		fs.removeSync(path.join(originallocation,'content/config/database.js')); 
		fs.removeSync(path.join(originallocation,'public/uploads/files')); 
		// fs.removeSync(path.join(originallocation,'content/extensions/extensions.json'));  
		fs.removeSync(path.join(originallocation,'processes'));  
		fs.removeSync(path.join(originallocation,'logs'));  

		moveInstalledPeriodic(); 
	});
};

npm.load({
	'strict-ssl': false,
	'production': true,
	'skip-install-periodic-ext': true,
	'upgrade-install-periodic-ext' : upgradeinstall
},function (err) {
	if (err) {
		console.error(err);
	}
	else {
		npm.commands.install([
			'periodicjs.ext.admin@1.8.5',
			'periodicjs.ext.dbseed@1.5.3',
			'periodicjs.ext.default_routes@1.5.3',
			'periodicjs.ext.install@1.5.3',
			'periodicjs.ext.login@1.5.4',
			'periodicjs.ext.mailer@1.5.3',
			'periodicjs.ext.scheduled_content@1.5.2',
			'periodicjs.ext.user_access_control@1.5.4',
			],
		function (err 
			//,data
			) {
			if (err) {
				console.error(err);
			}
			else {
				fs.open(originallocation,'r',function(err){
					if(err){
						console.log('Installed Periodicjs');
						process.exit(0);
					}
					else if(upgradeinstall || upgradeinstallalias){
						upgradePeriodic();
					}
					else if(nodemoduleinstall){
						console.log('Installed Periodicjs');
						process.exit(0);
					}
					else{
						moveInstalledPeriodic();
						// console.log('\u0007');
						// commandprompt.start();
						// commandprompt.get(schema, function (err, result) {
						//   if(err){
						// 		console.error(err);
						// 		process.exit(0);
						// 	}
						// 	else{
						// 		if(result.auto_clean_up.match(/y/gi)){
						// 			moveInstalledPeriodic();
						// 		}
						// 		else{
						// 			console.log('Installed Periodicjs');
						// 			process.exit(0);
						// 		}
						// 	}
						// });
					}
				});
			}
		});	
		npm.on('log', function (message) {
			console.log(message);
		});
	}
});