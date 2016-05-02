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
	return fs.ensureDirAsync(path.join(application_root,'logs'));
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
	return fs.copyAsync(install_package_path,application_root_path,{clobber:false});
};

/**
 * Test whether periodic project has an index file
 * @param  {[type]} resolve     [description]
 * @param  {[type]} reject){} [description]
 * @return {[type]}             [description]
 */
let project_index_js = function(){
	let project_index_filename = 'index.js';
	let project_index_path = path.join(installation_resources,project_index_filename);
	let application_root_path = path.join(application_root,project_index_filename);
	return fs.copyAsync(project_index_path,application_root_path,{clobber:false});
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
		return project_index_js();
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