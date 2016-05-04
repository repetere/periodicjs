'use strict';
/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2016 Yaw Joseph Etse. All rights reserved.
 */

const Promisie = require('promisie');
const fs =  Promisie.promisifyAll(require('fs-extra'));
const path = require('path');
const application_root = path.resolve(__dirname,'../../../');
const installation_resources = path.join(__dirname,'install_resources');
const periodic_module_resources = path.join(__dirname,'../');
const npmhelper = require('./npmhelper')({npmhelper_from_installer:true});
const async = require('async');
const Utilities = require('periodicjs.core.utilities');
const CoreUtilities = new Utilities({});
var install_errors=[];
var already_installed = false;

/**
 * create git ignore file if one doesnt exist, based off of the npm ignore file
 * @return {[type]} [description]
 */
let create_project_files = function(){
	return 	fs.copyAsync(path.join(__dirname,'../.npmignore'), path.join(application_root,'./.gitignore'),{clobber:false}); 
};

/**
 * create log directory
 * @return {[type]} [description]
 */
let create_log_directory = function(){
	return Promise.all([
		fs.ensureDirAsync(path.join(application_root,'logs')),
		fs.ensureDirAsync(path.join(application_root,'cache')),
		fs.ensureDirAsync(path.join(application_root,'process'))]);
};

/**
 * Test whether periodic project has a package json file
 * @param  {[type]} resolve     [description]
 * @param  {[type]} reject){} [description]
 * @return {Promise}             package check promise
 */
let project_package_json = function(){
	let install_package_json_filename = 'package.json';
	let install_package_path = path.join(installation_resources,install_package_json_filename);
	let application_package_json_root_path = path.join(application_root,install_package_json_filename);
	let original_project_package_json = {};
	let application_root_path = path.join(application_root,install_package_json_filename);
	try{
		let project_package_json_data = fs.readJsonSync(application_package_json_root_path,{throws: false});
		let periodic_package_json_data = fs.readJsonSync(path.join(periodic_module_resources,install_package_json_filename),{throws:false});
		let sample_project_package_json_data = fs.readJsonSync(install_package_path,{throws:false});
		original_project_package_json = Object.assign({},periodic_package_json_data,sample_project_package_json_data,project_package_json_data);
		already_installed = true;
	}
	catch(e){
		let errorRegExp = /no such file or directory/gi;
		if(!e.message.match(errorRegExp)){
			install_errors.push(e);
		}
	};
	let periodicjs_package_json = fs.readJsonSync(path.join(periodic_module_resources,'package.json'));
	let custom_app_package_json = Object.assign({},original_project_package_json,periodicjs_package_json);
	custom_app_package_json.name = (original_project_package_json.name) ? original_project_package_json.name : custom_app_package_json.name;
	custom_app_package_json.license = (original_project_package_json.license) ? original_project_package_json.license : custom_app_package_json.license;
	custom_app_package_json.readme = (original_project_package_json.readme) ? original_project_package_json.readme : custom_app_package_json.readme;
	custom_app_package_json.description = (original_project_package_json.description) ? original_project_package_json.description : custom_app_package_json.description;
	custom_app_package_json.repository = (original_project_package_json.repository) ? original_project_package_json.repository : custom_app_package_json.repository;
	
	Object.keys(custom_app_package_json).forEach((prop)=>{
		if(prop.charAt(0)==='_'){
			delete custom_app_package_json[prop];
		}
	});

	return fs.outputJsonAsync(application_root_path,custom_app_package_json, {spaces: 2});
};

/**
 * Test whether periodic project has an index file
 * @param  {[type]} resolve     [description]
 * @param  {[type]} reject){} [description]
 * @return {[type]}             [description]
 */
let project_files_copy = function(){
	let project_index_filename = 'index.js';
	let project_index_path = path.join(periodic_module_resources,project_index_filename);
	let application_root_path = path.join(application_root,project_index_filename);
	return Promise.all([
			fs.copyAsync(project_index_path,application_root_path,{clobber:true}), //index.js
			fs.copyAsync( path.join(periodic_module_resources,'scripts'),path.join(application_root,'scripts'),{clobber:true}),
			fs.copyAsync( path.join(periodic_module_resources,'nodemon.json'),path.join(application_root,'nodemon.json'),{clobber:true}),
			fs.copyAsync( path.join(periodic_module_resources,'test'),path.join(application_root,'test'),{clobber:true}),
			fs.copyAsync( path.join(periodic_module_resources,'content'),path.join(application_root,'content'),{clobber:false}),
			fs.copyAsync( path.join(periodic_module_resources,'public'),path.join(application_root,'public'),{clobber:false}),
			fs.copyAsync( path.join(periodic_module_resources,'app'),path.join(application_root,'app'),{clobber:true}),
		]);
};

/**
 * test if periodic is already installed, if so run deploysync, otherwise install standard extensions
 * @return {[type]} [description]
 */
let install_extensions = function(){
	let application_extensions=false;
	let application_extensions_path = path.join(application_root,'content/config/extensions.json');
	try{
		application_extensions = fs.readJsonSync(application_extensions_path,{throws:false});
	}
	catch(e){
		install_errors.push(e);
	};
	// console.log('application_extensions',application_extensions);

	if(application_extensions && already_installed){
		console.log('Periodic Already Installed, Upgrading');
		return Promisie.promisify(async.waterfall)([
			npmhelper.getInstalledExtensions,
			npmhelper.getMissingExtensionsFromConfig,
			npmhelper.installMissingExtensions,
			npmhelper.installMissingNodeModules,
			npmhelper.getThemeName,
			npmhelper.installThemeModules
			]);
	}
	else{
		console.log('New Periodic Installation');
		return Promisie.promisify(npmhelper.cleanInstallStandardExtensions)(
		{});
	}
};

//install the new periodic
create_log_directory()
	.then(()=>{
		return create_project_files();
	})
	.then(()=>{
		return project_package_json();
	})
	.then(()=>{
		return project_files_copy();
	})
	.then(()=>{
		return install_extensions();
	})
	.then((result)=>{
		if(already_installed){
			console.log('post install deploysync result',result);
			CoreUtilities.restart_app({});
		}
		console.log('Installed Periodic');
		if(install_errors.length >0){
			console.log('Install Warnings',install_errors);
		}
		process.exit(0);	
	})
	.catch((e)=>{
		console.error('Could not install Periodic');
		console.error(e,e.stack);
		process.exit(0);
	});