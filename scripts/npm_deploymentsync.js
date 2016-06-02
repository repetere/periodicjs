/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

const Promisie = require('promisie');
const fs =  Promisie.promisifyAll(require('fs-extra'));
const path = require('path');
const npm = require('npm');
const semver = require('semver');
// const PeriodicConfig = require('../app/lib/config');
const EXTENSION_JSON_PATH = 'content/config/extensions.json';

var application_root = process.cwd();
var extensions_json_path;
var extensions_json_data;
var application_config_override_data;
var extensions_json_backup_path;
var application_themename;
var installed_config_override_node_modules = [];

let get_private_dir =function(file_parent_dir){
	return function(privatedir){
		return file_parent_dir+'/'+privatedir;
	};
};

/**
 * creates a backup copy of extensions.json
 * @return {[type]} [description]
 */
let create_copy_of_extension_json_backup = function(){
	extensions_json_path = path.join(application_root,EXTENSION_JSON_PATH);
	extensions_json_backup_path = extensions_json_path+'.backup';
	return fs.copyAsync(extensions_json_path,extensions_json_backup_path);
};

/**
 * restores a backup copy of extensions.json
 * @return {[type]} [description]
 */
let restore_copy_of_extension_json_backup = function(){
	return fs.copyAsync(extensions_json_backup_path,extensions_json_path);
};

/** 
 * @description get list of installed extensions to test against extensions.json to see if during deployment, new extensions were added, if so, then install them
 */
let get_installed_extensions = function(options){
	try{
		let project_periodic_directory = path.join(application_root,'node_modules');
		application_config_override_data = fs.readJSONSync(path.resolve(application_root,'content/config/config.json'),{throws:false});

		return new Promise((resolve,reject)=>{
			fs.readdirAsync(project_periodic_directory)
				.then((files)=>{
					let installedmod =[];
				
					for(let x in files){
						if(files[x].match(/@/gi)){
							let privatemodules = fs.readdirSync(path.join(project_periodic_directory,files[x]));
							// console.log('privatemodules',privatemodules);
							privatemodules = privatemodules.map(get_private_dir(files[x]));
							files = files.concat(privatemodules);
						}
					}
					// console.log('files',files);
					// try{
					// 	installed_node_modules_folder_names = files;
					// }
					// catch(e){
					// 	console.error('file assign error',e,e.stack)

					// 	throw new Error(e);
					// }
					// console.log('()*(#*@)(#*@)*$)@#($*@)#$*installed_node_modules_folder_names',installed_node_modules_folder_names)
					for(let x in files){
						if(files[x].match(/periodicjs\.ext/gi)){
							let ext_package_json = fs.readJsonSync(path.join(project_periodic_directory,files[x],'/package.json'));
							installedmod.push(files[x]+'@'+ext_package_json.version);					
						}
					}
					if(application_config_override_data && application_config_override_data.node_modules && Array.isArray(application_config_override_data.node_modules)){
						// console.log('application_config_override_data.node_modules',application_config_override_data.node_modules);
						// console.log('files',files);
						let app_config_node_modules = application_config_override_data.node_modules.map((app_conf_node_module)=>{
							return app_conf_node_module.split('@')[0];
						});
						// console.log('app_config_node_modules',app_config_node_modules);
						files.forEach((npm_module_folder_name)=>{
							if(app_config_node_modules.includes(npm_module_folder_name)){
								let installed_custom_mode_name_and_version = npm_module_folder_name+'@'+fs.readJsonSync(path.join(project_periodic_directory,npm_module_folder_name,'/package.json'),{throws:false}).version;
								
								if(application_config_override_data.node_modules.includes(installed_custom_mode_name_and_version)){

									installed_config_override_node_modules.push(installed_custom_mode_name_and_version);
								}
							}
						});
						// console.log('installed_node_modules_folder_names',installed_node_modules_folder_names);
					// installed_node_modules_folder_names = files.concat([]);
						// console.log('installed_config_override_node_modules',installed_config_override_node_modules);
					}
					console.log('installed modules',installedmod);
					resolve(installedmod);
			})
			.catch((err)=>{
				reject(err);
			});
		});
	}
	catch(e){
		return new Promise((resolve,reject)=>{
			console.error('uncaught get_installed_extensions error',e);
			reject(e);
		});
	}
};

/**
 * gets an array of missing extensions
 * @param  {[type]} installedExtensions [description]
 * @return {[type]}                     [description]
 */
var get_missing_extensions = function(installedExtensions){
	extensions_json_data = fs.readJsonSync(extensions_json_path).extensions;
	let missingExtensions=[];
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
		console.log('missingExtensionsInstallList',missingExtensionsInstallList);
		return missingExtensionsInstallList;
	};

	return new Promise((resolve,reject)=>{
		try{
			resolve(getMissingExtensions(installedExtensions,extensions_json_data));
		}
		catch(e){
			console.error('get_missing_extensions uncaught error',e.stack);
			reject(e);
		}
	});
};

/**
 * [install_node_modules description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
let install_node_modules = function(options = { 
		npm_load_options:{},
		npm_install_options:{},
		node_modules_to_install : [] 
	}){
	let npm_load_options = Object.assign({
			'strict-ssl': false,
			'production': true,
			'silent': true,
			'no-optional': true
		},options.npm_load_options);
	let npm_install_options = Object.assign({
			'strict-ssl': false,
			'production': true,
			'silent': true,
			'no-optional': true
		},options.npm_load_options);
	let node_modules_to_install = options.node_modules_to_install;

	return new Promise((resolve,reject)=>{
		try{
			if(Array.isArray(node_modules_to_install) && node_modules_to_install.length>0){
				npm.load(npm_load_options,(err)=>{
					if(err){
						console.error('install_node_modules err',err);
						reject(err);
					}
					else{
						Object.keys(npm_install_options).forEach((npm_install_option_item)=>{
							npm[npm_install_option_item] = npm_install_options[npm_install_option_item];
						});
						npm.commands.install(node_modules_to_install,(err)=>{
							if(err){
								console.error('commands install install_node_modules err',err);
								reject(err);
							}
							else{
								resolve('installed node modules: '+node_modules_to_install);
							}
						});
					}
				});
			}
			else{
				resolve('no modules to install');
			}
		}
		catch(e){
			console.error('install_node_modules e',e.stack);
			reject(e);
		}
	});
};

/**
 * [install_missing_extensions description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
let install_missing_extensions = function(missing_extensions){
	let install_prefix = application_root;
	let npm_load_options = {
		'save-optional': false,
		prefix: install_prefix
	};
	let npm_install_options = {
		'save-optional': false,
		prefix: install_prefix
	};

	return install_node_modules({
		npm_load_options: npm_load_options,
		npm_install_options: npm_install_options,
		node_modules_to_install : missing_extensions 
	});
};

/**
 * [remove_periodicjs_node_module description]
 * @return {[type]} [description]
 */
let remove_periodicjs_node_module = function(){
	return new Promise((resolve,reject)=>{
		try{
			fs.remove(path.join(application_root,'node_modules/periodicjs'),(err)=>{
				if(err){
					console.error('WARNING - COULD NOT REMOVE PERIODIC NODE MODULE',err.stack);
				}
				resolve('removed node module');
			});
		}
		catch(e){
			console.error('WARNING - COULD NOT REMOVE PERIODIC NODE MODULE',e.stack);
			resolve(e);
		}
	});
};

/**
 * [install_custom_config_node_modules description]
 * @return {[type]} [description]
 */
let install_custom_config_node_modules = function(){
	try{
		let install_prefix = application_root;
		let node_modules_to_install = application_config_override_data.node_modules.filter((app_config_node_module_name)=>{
			return !installed_config_override_node_modules.includes(app_config_node_module_name);
		});

		let npm_load_options = {
			'strict-ssl': false,
			'save-optional': true,
			'no-optional': true,
			'production': true,
			prefix: install_prefix
		};
		let npm_install_options = {
			'save-optional': true,
			'no-optional': true,
			prefix: install_prefix
		};
		console.log('custom modules to install: ',node_modules_to_install);
		return install_node_modules({
			npm_load_options: npm_load_options,
			npm_install_options: npm_install_options,
			node_modules_to_install : node_modules_to_install 
		});
	}
	catch(e){
		return new Promise((resolve,reject)=>{
			console.error('WARNING - COULD NOT INSTALL CUSTOM NODE MODULES',e.stack);
			resolve(e);
		});

	}
};

/**
 * TODO: get themename of last run process
 * @param  {object}   options  options parameter
 * @param  {function} callback async callback function
 * @return {string}            return the name of the theme for npm modules to install
 */
let get_theme_name = function(){
	return new Promise((resolve,reject)=>{
		try{
			if(application_config_override_data.theme){
				application_themename = application_config_override_data.theme;
			}
			else{
				application_themename = fs.readJSONSync(path.resolve(application_root,'content/config/environment/default.json')).theme;
			}
			// console.log('application_themename',application_themename);
			resolve(application_themename);
		}
		catch(e){
			console.error('WARNING - COULD NOT GET THEMENAME',e.stack);
			reject(e);
		}
	});
};

/**
 * [install_theme_node_modules description]
 * @param  {[type]} periodic_theme [description]
 * @return {[type]}         [description]
 */
let install_theme_node_modules = function(periodic_theme){
	let project_periodic_directory = path.join(application_root,'node_modules');
	let install_prefix = application_root;
	let node_modules_to_install = [];
	let npm_load_options = {
		'strict-ssl': false,
		'save-optional': true,
		'no-optional': true,
		'production': true,
		prefix: install_prefix
	};
	let npm_install_options = {
		'strict-ssl': false,
		'save-optional': true,
		'no-optional': true,
		'production': true,
		prefix: install_prefix
	};
	try{
		let files = fs.readdirSync(project_periodic_directory);
		if(periodic_theme){
			
			let theme_dir_path = path.resolve(application_root,'content/themes',periodic_theme);
			let theme_package_json = fs.readJSONSync(path.resolve(theme_dir_path,'package.json'),{throws:false});
			let installed_node_modules_folder_names=[];
			if(periodic_theme && theme_package_json && theme_package_json.dependencies){
				for(let x in files){
					if(files[x].match(/@/gi)){
						let privatemodules = fs.readdirSync(path.join(project_periodic_directory,files[x]));
						privatemodules = privatemodules.map(get_private_dir(files[x]));
						// console.log('privatemodules',privatemodules);
						installed_node_modules_folder_names = installed_node_modules_folder_names.concat(privatemodules);
					}
				}
				installed_node_modules_folder_names = installed_node_modules_folder_names.concat(files);

				let theme_config_node_modules = Object.keys(theme_package_json.dependencies);
					// console.log('installed_node_modules_folder_names',installed_node_modules_folder_names)
				theme_config_node_modules.forEach((theme_package)=>{
					// console.log('theme_package',theme_package);
					if(!installed_node_modules_folder_names.includes(theme_package)){
					
							node_modules_to_install.push(`${theme_package}@${theme_package_json.dependencies[theme_package]}`);
					}
					else{
						let installed_theme_node_module_version = fs.readJsonSync(path.join(project_periodic_directory,theme_package,'/package.json'),{throws:false}).version;
						// console.log('theme_package',theme_package,theme_package_json.dependencies[theme_package],installed_theme_node_module_version)
						if(!semver.satisfies(installed_theme_node_module_version,theme_package_json.dependencies[theme_package])){

							node_modules_to_install.push(`${theme_package}@${theme_package_json.dependencies[theme_package]}`);
						
					
						}
					}
						
				// console.log('theme_package_json.dependencies',theme_package_json.dependencies);
				// console.log('theme_config_node_modules',theme_config_node_modules);
				// theme_config_node_modules.forEach((theme_config_module_folder_name)=>{
				
				// });

				});
			}
			
		}
		console.log('theme modules to install: ',node_modules_to_install);
		return install_node_modules({
			npm_load_options: npm_load_options,
			npm_install_options: npm_install_options,
			node_modules_to_install : node_modules_to_install 
		});
	}
	catch(e){
		return new Promise((resolve,reject)=>{
			console.error('WARNING - COULD NOT INSTALL THEME NODE MODULES',e.stack);
			resolve(e);
		});

	}
};

/**
 * [deploy_sync_promise install periodic dependencies]
 * @param  {Object} options [description]
 * @return {[type]}         [description]
 */
var deploy_sync_promise = function(options={}){
	application_root = (options.application_root) ? options.application_root : application_root;

	console.log('using application_root',application_root);

	return new Promise((resolve,reject)=>{
		create_copy_of_extension_json_backup()
			.then(()=>{
				return remove_periodicjs_node_module();
			})
			.then(()=>{
				return get_installed_extensions();
			})
			.then((installed_extensions)=>{
				return get_missing_extensions(installed_extensions);
			})
			.then((missing_extensions)=>{
				return install_missing_extensions(missing_extensions);
			})
			.then(()=>{
				return install_custom_config_node_modules();
			})
			.then(()=>{
				return get_theme_name();
			})
			.then((periodic_theme)=>{
				return install_theme_node_modules(periodic_theme);
			})
			.then(()=>{
				return restore_copy_of_extension_json_backup();
			})
			.then(()=>{
				return remove_periodicjs_node_module();
			})
			.then(()=>{
				resolve('completed deploy sync');
			})
			.catch((e)=>{
				console.error('Could not run deploy sync');
				console.error(e,e.stack);
				reject(e);
			});
	});
};

exports.create_copy_of_extension_json_backup = create_copy_of_extension_json_backup;
exports.restore_copy_of_extension_json_backup = restore_copy_of_extension_json_backup;
exports.get_installed_extensions = get_installed_extensions;
exports.get_missing_extensions = get_missing_extensions;
exports.install_node_modules = install_node_modules;
exports.install_missing_extensions = install_missing_extensions;
exports.remove_periodicjs_node_module = remove_periodicjs_node_module;
exports.install_custom_config_node_modules = install_custom_config_node_modules;
exports.get_theme_name = get_theme_name;
exports.install_theme_node_modules = install_theme_node_modules;
exports.deploy_sync_promise = deploy_sync_promise;