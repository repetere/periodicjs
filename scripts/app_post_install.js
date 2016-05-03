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
	let install_package_filename = 'package.json';
	let install_package_path = path.join(installation_resources,install_package_filename);
	let application_root_path = path.join(application_root,install_package_filename);
	let original_project_package_json = {};
	try{
		original_project_package_json = fs.readJsonSync(application_root_path,{throws: false}) || fs.readJsonSync(install_package_path,{throws:false}) || {};
	}
	catch(e){
	};
	let periodicjs_package_json = fs.readJsonSync(path.join(periodic_module_resources,'package.json'));
	let custom_app_package_json = Object.assign({},original_project_package_json,periodicjs_package_json);
	custom_app_package_json.name = original_project_package_json.name;
	custom_app_package_json.license = original_project_package_json.license;
	custom_app_package_json.readme = original_project_package_json.readme;
	custom_app_package_json.description = original_project_package_json.description;
	custom_app_package_json.repository = original_project_package_json.repository;
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

//install the new periodic
create_log_directory()
	.then(()=>{
		return create_project_files();
	})
	.then(()=>{
		return project_package_json();
	})
	/**
	 * Check already installed, if already instaled, run deploysync
	 * if note installed, clean install standard extensions and copy content and public folders
	 */
	.then(()=>{
		return project_files_copy();
	})
	.then(()=>{
		console.log('Installed Periodic');
		process.exit(0);	
	})
	.catch((e)=>{
		console.error('Could not install Periodic');
		console.error(e.stack);
		process.exit(0);
	});