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
		async = require('async'),
		Utilities = require('periodicjs.core.utilities'),
		CoreUtilities = new Utilities({}),
		Extensions = require('periodicjs.core.extensions'),
		npm = require('npm'),
		upgradeinstall = typeof process.env.npm_config_upgrade_install_periodic ==='string' ||  typeof process.env.npm_config_update ==='string',
		upgradeinstallalias = typeof process.env.npm_config_upgrade ==='string',
		originalnodemoduleslocation,
		originallocation,
		newlocation = path.resolve(process.cwd(),'../../periodicjs'),
		standardExtensions = require('./standard_extensions'),	
		extension_config_path = path.join(process.cwd(),'content/config/extensions.json');
var npmhelper_from_installer = false;

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

								CoreUtilities.restart_app({
									callback:function(err,text) { 
										console.log ('err',err);
										console.log ('moveinstalledperiodic',text);
										process.exit(0);
									}
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

var remove_installed_periodic_from_node_modules = function(options,callback){
	var prefixpath = options.prefixpath;
	var originalpath = path.join(prefixpath,'node_modules/periodicjs');
	var newpath = path.join(prefixpath,'cache/installed_periodicjs');
	var original_scripts = path.join(originalpath,'scripts');
	var original_content = path.join(originalpath,'content');
	var original_cache = path.join(originalpath,'cache');
	var original_node_modules = path.join(originalpath,'node_modules');
	var original_package_json = path.join(originalpath,'package.json');
		// console.log('prefixpath',prefixpath);
		// console.log('originalpath',originalpath);
		// console.log('------------------------------------');
		// console.log('original_scripts',original_scripts);
		// console.log('original_content',original_content);
		// console.log('original_cache',original_cache);
		// console.log('original_node_modules',original_node_modules);
		// console.log('original_package_json',original_package_json);
	try{
		fs.removeSync(original_scripts,{throws:false});
		fs.removeSync(original_content,{throws:false});
		fs.removeSync(original_cache,{throws:false});
		fs.removeSync(original_node_modules,{throws:false});
		fs.removeSync(original_package_json,{throws:false});
	}
	catch(e){
		console.log('fs.removeSync err',err)
		console.log(e);
	}
	callback(null);

	// fs.rename(originalpath,newpath,(err)=>{
	// 	console.log('remove_installed_periodic_from_node_modules fs.remove err',err);
	// 	callback(null);
	// });
};

var installCustomConfigNodeModules = function(callback){
	try{
		var prefixpath = (npmhelper_from_installer) ? path.resolve(__dirname,'../../../') : process.cwd();
		var currentConfig = fs.readJSONSync(path.resolve(prefixpath,'content/config/config.json')),
			npmconfig ={
				'strict-ssl': false,
				'save-optional': true,
				'no-optional': true,
				'production': true
			};
		if(npmhelper_from_installer){
			npmconfig.prefix = prefixpath;
		}

		if(currentConfig && currentConfig.node_modules && Array.isArray(currentConfig.node_modules)  && currentConfig.node_modules.length >0 ){
		 	npm['save-optional'] = true;
		 	npm['no-optional'] = true;
			console.log('custom config.json node_modules',currentConfig.node_modules.length);
			npm.load(
				npmconfig,
				function (err) {
				if (err) {
					console.error(err);
					callback(err);
				}
				else {
				 	npm['save-optional'] = true;
				 	npm['no-optional'] = true;
				 	npm['prefix'] = prefixpath;

				 				// callback(null,'no custom node modules');
					remove_installed_periodic_from_node_modules({prefixpath:prefixpath},(err)=>{
				 		if(err){callback(err);}
				 		else{
							npm.commands.i(
									currentConfig.node_modules,
									callback
								);
				 		}
				 	});



				}
			});
		}
		else{
			callback(null,'no custom node modules');
		}

	}
	catch(e){
		console.error('installCustomConfigNodeModules e',e);
		callback(e);
	}
};

var installStandardExtensions = function(callback){
	var npmconfig ={
		'strict-ssl': false,
		'no-optional': true,
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
	 			npm['no-optional'] = true;
				npm.commands.install(
					standardExtensions,
					callback
				);
			}
		});
	});
};

var cleanInstallStandardExtensions = function(options,callback){
	console.log('about to install standard clean install');
	var npmconfig = {
		'strict-ssl': false,
		'save-optional': false,
		'no-optional': false,
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
 			npm['no-optional'] = true;
		 	// npm['save-optional'] = true;
			npm.commands.install(
				standardExtensions,
				callback
			);
		}
	});
};

/** 
 * @description get list of installed extensions to test against extensions.json to see if during deployment, new extensions were added, if so, then install them
 */
var getInstalledExtensions = function(callback){
	try{
		var project_periodic_directory = path.join(__dirname,'../node_modules');

		fs.readdir(project_periodic_directory,function(err,files){
			var installedmod =[];
			var get_private_dir =function(file_parent_dir){
				return function(privatedir){
						return file_parent_dir+'/'+privatedir;
					};
			};
			for(let x in files){
				if(files[x].match(/@/gi)){
					let privatemodules = fs.readdirSync(path.join(project_periodic_directory,files[x]));
					// console.log('privatemodules',privatemodules);
					privatemodules = privatemodules.map(get_private_dir(files[x]));
					files = files.concat(privatemodules);
				}
			}
				// console.log('files',files);
			for(let x in files){
				if(files[x].match(/periodicjs\.ext/gi)){
					let ext_package_json = fs.readJsonSync(path.join(project_periodic_directory,files[x],'/package.json'));
					installedmod.push(files[x]+'@'+ext_package_json.version);					
				}
			}
			console.log('installed modules',installedmod);
			callback(err,installedmod);
		});
	}
	catch(e){
		callback(e);
	}
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
					if(installedExtensions[y]===allExtensionsFromConf[z].name+'@'+allExtensionsFromConf[z].version || (
							allExtensionsFromConf[z].name.match('/') && 
							installedExtensions[y]===allExtensionsFromConf[z].name.split('/')[1]+'@'+allExtensionsFromConf[z].version

						) ){
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
					if(allExtensionsFromConf[a].name.match('@')){
						console.log(`allExtensionsFromConf[${a}].name is private repo `,allExtensionsFromConf[a].name);
						missingExtensionsInstallList.push(allExtensionsFromConf[a].name+'@'+allExtensionsFromConf[a].version);
					}
					else if(allExtensionsFromConf[a].name.match('/')){
						console.log('allExtensionsFromConf[a].name has a / ',allExtensionsFromConf[a].name);
						missingExtensionsInstallList.push('git+ssh://git@github.com:'+allExtensionsFromConf[a].name+'#'+allExtensionsFromConf[a].version);
					}
					else{
						missingExtensionsInstallList.push(allExtensionsFromConf[a].name+'@'+allExtensionsFromConf[a].version);
					}
				}
			}
		}
		return missingExtensionsInstallList;
	},
	missingExtensions=[];

	var checkMissingExtensionsCallback = function(err,currentextensions){
		if(err){
			callback(err,null);
		}
		else{
			// console.log('currentextensions',currentextensions);
			missingExtensions = getMissingExtensions(installedExtensions,(currentextensions && currentextensions.extensions && Array.isArray(currentextensions.extensions))? currentextensions.extensions : currentextensions);
			console.log('missingExtensions',missingExtensions);		
			callback(null,missingExtensions);
		}
	};


	if(npmhelper_from_installer){
		fs.readJSON(path.resolve(__dirname,'../../../content/config/extensions.json'),checkMissingExtensionsCallback);
	}
	else{
		fs.readJSON(path.resolve(process.cwd(),'content/config/extensions.json'),checkMissingExtensionsCallback);
	}
};

var installMissingExtensions = function(missingExtensions,callback){
	if(missingExtensions && missingExtensions.length>0){
		var initialExtensionConf = (npmhelper_from_installer) ? fs.readJsonSync(path.resolve(__dirname,'../../../content/config/extensions.json')) :	fs.readJsonSync(extension_config_path);
		var npmloadoptions = {
			'strict-ssl': false,
			'production': true,
			'silent': true,
			'no-optional': true
			// 'skip_ext_conf': true
		};
		if(npmhelper_from_installer){
			extension_config_path = path.resolve(__dirname,'../../../content/config/extensions.json');
		}
		npmloadoptions.prefix = path.resolve(__dirname,'../');
		// console.log('installMissingExtensions initialExtensionConf length',initialExtensionConf.length);
		npm.load(npmloadoptions,
			function (err) {
			if (err) {
				callback(err,null);
			}
			else {
 				npm['no-optional'] = true;
 				npm.prefix = npmloadoptions.prefix;
			 	// npm['save-optional'] = true;
			 	npm.silent = true;
			 	npm.quiet = true;
				npm.commands.install(missingExtensions,
				function (err 
					//,data
					) {
						fs.writeJSONSync(extension_config_path,initialExtensionConf);
						console.log('restored conf in installMissingExtensions');
					if (err) {
						console.log('ERROR ERROR ERROR', err.stack);
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

var installPeriodicNodeModules = function(options,callback){
	var initialExtensionConf = 	fs.readJsonSync(extension_config_path),
		installPeriodicNodeModulesCallback = callback;
		var prefixpath = (npmhelper_from_installer) ? path.resolve(__dirname,'../../../') : process.cwd();
				// installPeriodicNodeModulesCallback(null,'installed PeriodicNodeModules with no errors');

		npm.load({
			'strict-ssl': false,
			'production': true,
			'silent': true,
			'no-optional': true,
			'save-optional': false,
			'skip_post_install':true,
			'skip_ext_conf': true,
			'prefix':prefixpath,
		},function (err) {
			if (err) {
				installPeriodicNodeModulesCallback(err,null);
			}
			else {
				// installPeriodicNodeModulesCallback(null,'installed PeriodicNodeModules with no errors');
			 	remove_installed_periodic_from_node_modules({prefixpath:prefixpath},(err)=>{
			 		if(err){callback(err);}
			 		else{
					 	npm['no-optional'] = true;
					 	npm['save-optional'] = false;
					 	npm.production = true;
					 	npm.silent = true;
					 	npm.skip_post_install = true;
					 	npm.quiet = true;
					 	npm.prefix = prefixpath;
						npm.commands.i([],
							function (err ) {
								fs.writeJSONSync(extension_config_path,initialExtensionConf);
								if (err) {
									installPeriodicNodeModulesCallback(err,null);
								}
								else {
									installPeriodicNodeModulesCallback(null,'installed PeriodicNodeModules with no errors');
								}
							});
			 		}
			 	});
				// callback(null,missingExtensions);
			}
		});
};

var installMissingNodeModulesAsync = function(missingExtensions,callback){

	var initialExtensionConf = (npmhelper_from_installer) ? fs.readJsonSync(path.resolve(__dirname,'../../../content/config/extensions.json')) :	fs.readJsonSync(extension_config_path);
	var prefixpath = (npmhelper_from_installer) ? path.resolve(__dirname,'../../../') : process.cwd();
	if(npmhelper_from_installer){
		extension_config_path = path.resolve(__dirname,'../../../content/config/extensions.json');
	}
		
	installCustomConfigNodeModules(function(err,customcallbackstatus){
		if(err){
			callback(err);
		}
		else{
			console.log('number of custom node modules and extensions',customcallbackstatus.length);
				// callback(null,missingExtensions);

			npm.load({
				'strict-ssl': false,
				'production': true,
				'silent': true,
				'no-optional': true,
				'save-optional': false,
				'skip_post_install':true,
				'skip_ext_conf': true,
				'prefix':prefixpath,
			},function (err) {
				if (err) {
					callback(err,null);
				}
				else {
				 	npm['no-optional'] = true;
				 	npm['save-optional'] = false;
				 	npm.production = true;
				 	npm.silent = true;
				 	npm.skip_post_install = true;
				 	npm.quiet = true;
				 	npm.prefix = prefixpath;
				 	remove_installed_periodic_from_node_modules({prefixpath:prefixpath},(err)=>{
				 		if (err){ throw err;}
				 						 	// console.log('installMissingNodeModules npm',npm);
					 	try{
							npm.commands.i([],
							function (err,data ) {
								console.log('trying to restore conf in installMissingNodeModules',data);

								// console.log('installMissingNodeModulesAsync extension_config_path',extension_config_path);
								// console.log('installMissingNodeModulesAsync initialExtensionConf',initialExtensionConf);
								fs.writeJSONSync(extension_config_path,initialExtensionConf);
								console.log('restored conf in installMissingNodeModules');
								if (err) {
									console.log('installMissingNodeModules err',err);
									callback(err,null);
								}
								else {
									console.log('installMissingNodeModules no errors');
									callback(null,missingExtensions);
								}
							});
					 	}
					 	catch(e){
					 		console.log('installMissingNodeModules e',e);
							callback(e,null);
					 	}
						// callback(null,missingExtensions);
				 	});
				}
			});
		}
	});
};

var installMissingNodeModules = function(missingExtensionStatus,missingExtensions,callback){
	console.log('missingExtensionStatus length',missingExtensionStatus.length);
	installMissingNodeModulesAsync(missingExtensions,callback);
};

/**
 * TODO: get themename of last run process
 * @param  {object}   options  options parameter
 * @param  {function} callback async callback function
 * @return {string}            return the name of the theme for npm modules to install
 */
var getThemeNameAsync = function(options,callback){
	console.log('tyring to getThemeNameAsync');
		var prefixpath = (npmhelper_from_installer) ? path.resolve(__dirname,'../../../') : process.cwd();
	var themename;
	fs.readJSON(path.resolve(prefixpath,'content/config/config.json'),function(err,confJSON){
		if(err){
			console.log('install theme modules err',err);
			callback(null,null);
		}
		else if(confJSON && confJSON.theme){
			themename = confJSON.theme;
			callback(null,themename);
		}
		else{
			// getThemeNameCallback(null,missingExtensionResult,null);
			fs.readJSON(path.resolve(prefixpath,'content/config/environment/default.json'),function(err,defaultConfJSON){
					// console.log('defaultConfJSON',defaultConfJSON);
				if(defaultConfJSON && defaultConfJSON.theme){
					themename =  defaultConfJSON.theme;
					callback(null,themename);
				}
				else{
					callback(null,null);
				}
			});
		}
	});
};

var getThemeName = function(missingExtensionResult,getThemeNameCallback){
	console.log('tyring to getThemeName');
	getThemeNameAsync({},function(err,themename){
			getThemeNameCallback(null,missingExtensionResult,themename);
	});
};

var installThemeModulesAsync = function(themename,callback){
		var prefixpath = (npmhelper_from_installer) ? path.resolve(__dirname,'../../../') : process.cwd();
	if(themename){
		var themedir = path.resolve(prefixpath,'content/themes',themename);
		console.log('themename',themename);
		console.log('themedir',themedir);
		fs.open(path.join(themedir,'package.json'),'r',function(err){
			if(err){
				callback(null,'no package.json in theme');
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
						callback(null);
					}
					else {
						npm.commands.install([themedir],
						function (err) {
							console.log('theme npm install err',err,themedir);
							callback(null,'installed theme node modules');
						});	
					}
				});
			}
		});
	}
	else{
		callback(null,'no config.json for theme module install');
	}
};

var installThemeModules = function(missingExtensionResult,themename,callback){
	installThemeModulesAsync(themename,function(err,theemmoduleresult){
		callback(null,missingExtensionResult,theemmoduleresult);
	});
};

var resyncPeriodicDependenciesAsync = function(options,resyncCB){
	var resyncInstalledModules,
		resyncMissingExtensions,
		resyncThemename;
	async.series({
		installnodemodules: function(cb){
			installPeriodicNodeModules({},function(err,data){
				console.log('installnodemodules',err,data);
				cb(err,data);
			});
		},
		getinstalledexts: function(cb){
			console.log('getinstalledexts');
			getInstalledExtensions(function(err,getInstalledExtensionsData){
				resyncInstalledModules = getInstalledExtensionsData;
				cb(err,getInstalledExtensionsData);
			});
		},
		getmissingexts: function(cb){
			getMissingExtensionsFromConfig(resyncInstalledModules,function(err,getMissingExtensionsData){
				resyncMissingExtensions = getMissingExtensionsData;
				cb(err,getMissingExtensionsData);
			});
		},
		installmissingexts: function(cb){
			installMissingNodeModulesAsync(resyncMissingExtensions,cb);
		},
		getthemename: function(cb){
			getThemeNameAsync({},function(err,themename){
				resyncThemename = themename;
				cb(err,themename);
			});
		},
		installthememods: function(cb){
			installThemeModulesAsync(resyncThemename,cb);
		}
	},resyncCB);
};

var npmhelper = function(options){
	originalnodemoduleslocation = options.originalnodemoduleslocation;
	originallocation = options.originallocation;
	newlocation = options.newlocation;
	npmhelper_from_installer = options.npmhelper_from_installer;

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
		installThemeModules: installThemeModules,
		installPeriodicNodeModules:installPeriodicNodeModules,
		resyncPeriodicDependenciesAsync: resyncPeriodicDependenciesAsync,
		cleanInstallStandardExtensions: cleanInstallStandardExtensions
	};
};

module.exports =npmhelper;