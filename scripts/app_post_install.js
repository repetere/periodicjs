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
const installation_resources = path.join(__dirname,'install_resources');
const periodic_module_resources = path.join(__dirname,'../');
const npmhelper = require('./npmhelper')({npmhelper_from_installer:true});
const npmcleaninstall = require('./npm_clean_install');
const deploy_sync = require('./npm_deploymentsync');
const async = require('async');
const Utilities = require('periodicjs.core.utilities');
const CoreUtilities = new Utilities({});
var application_root = path.resolve(process.cwd(),'../../');// process.cwd();// path.resolve(__dirname,'../../../');
var install_errors=[];
var already_installed = false;

// console.log('__dirname',__dirname);
// console.log('process.cwd()',process.cwd());
// console.log('application_root',application_root);

/**
 * create git ignore file if one doesnt exist, based off of the npm ignore file
 * @return {[type]} [description]
 */
let create_project_files = function(){
	return Promise.all([
		fs.copyAsync(path.join(__dirname,'../.npmignore'), path.join(application_root,'./.gitignore'),{clobber:false}),
		// fs.copyAsync(path.join(__dirname,'../.npmignore'), path.join(application_root,'./.npmignore'),{clobber:false}),
	]);
};

/**
 * create log directory
 * @return {[type]} [description]
 */
let create_log_directory = function(){
	if(fs.readJsonSync(path.join(process.cwd(),'package.json')).name!=='periodicjs'){
		already_installed=true;
		application_root=process.cwd();
	}
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
	let package_json_filename = 'package.json';
	let node_modules_scripts_resources_package_file_path = path.join(installation_resources,package_json_filename);
	let node_modules_package_file_path = path.join(periodic_module_resources,package_json_filename);
	let application_package_file_path = path.join(application_root,package_json_filename);
	
	let node_modules_scripts_resources_package_data ={};
	let node_modules_package_data ={};
	let application_package_file_data=false;
	let original_project_package_json ={};

	node_modules_scripts_resources_package_data = fs.readJsonSync(node_modules_scripts_resources_package_file_path,{throws: false});
	node_modules_package_data = fs.readJsonSync(path.join(node_modules_package_file_path),{throws:false});

	try{
		application_package_file_data = fs.readJsonSync(application_package_file_path,{throws:false});

		if(application_package_file_data){
			// console.log('application_package_file_path',application_package_file_path)
			// console.log('application_package_file_data',application_package_file_data)
			already_installed = true;
			application_root=process.cwd();
		}
	}
	catch(e){
		let errorRegExp = /no such file or directory/gi;
		if(!e.message.match(errorRegExp)){
			install_errors.push(e);
		}
	};

	let custom_app_package_json = Object.assign({},node_modules_package_data,node_modules_scripts_resources_package_data);
	if(application_package_file_data && application_package_file_data.name){
		custom_app_package_json.name = (application_package_file_data.name) ? application_package_file_data.name : custom_app_package_json.name;
		custom_app_package_json.license = (application_package_file_data.license) ? application_package_file_data.license : custom_app_package_json.license;
		custom_app_package_json.readme = (application_package_file_data.readme) ? application_package_file_data.readme : custom_app_package_json.readme;
		custom_app_package_json.description = (application_package_file_data.description) ? application_package_file_data.description : custom_app_package_json.description;
		custom_app_package_json.repository = (application_package_file_data.repository) ? application_package_file_data.repository : custom_app_package_json.repository;
		custom_app_package_json.author = (application_package_file_data.author) ? application_package_file_data.author : custom_app_package_json.author;
		custom_app_package_json.contributors = (application_package_file_data.contributors) ? application_package_file_data.contributors : custom_app_package_json.contributors;
		custom_app_package_json.keywords = (application_package_file_data.keywords) ? application_package_file_data.keywords : custom_app_package_json.keywords;
		custom_app_package_json.maintainers = (application_package_file_data.maintainers) ? application_package_file_data.maintainers : custom_app_package_json.maintainers;
		custom_app_package_json.optionalDependencies = (application_package_file_data.optionalDependencies) ? application_package_file_data.optionalDependencies : custom_app_package_json.optionalDependencies;
	}
	
	Object.keys(custom_app_package_json).forEach((prop)=>{
		if(prop.charAt(0)==='_'){
			delete custom_app_package_json[prop];
		}
	});

	return fs.outputJsonAsync(application_package_file_path,custom_app_package_json, {spaces: 2});
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
			fs.copyAsync( path.join(periodic_module_resources,'Gruntfile.js'),path.join(application_root,'Gruntfile.js'),{clobber:true}),
			fs.copyAsync( path.join(periodic_module_resources,'jsdoc.json'),path.join(application_root,'jsdoc.json'),{clobber:true}),
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
	console.log('already_installed',already_installed)

	if(application_extensions && already_installed){
		console.log('Periodic Already Installed, Upgrading');
		return deploy_sync.deploy_sync_promise({application_root:application_root});
	}
	else{
		console.log('New Periodic Installation');
		// return Promisie.promisify(npmhelper.cleanInstallStandardExtensions)({});
		return npmcleaninstall.installStandardExtensionsAsync({});
	}
};

let install_complete_callback = function(result){
	if(already_installed){
		console.log('post install deploysync result',result);
		CoreUtilities.restart_app({});
	}
	console.log('Installed Periodic');
	if(install_errors.length >0){
		console.log('Install Warnings',install_errors);
	}
	process.exit(0);	
};

let install_error_callback = function(error){
	console.error('Could not install Periodic');
	console.error(e,e.stack);
	process.exit(0);
};

//install the new periodic
create_log_directory()
	.then(()=>{
		console.log('create log already_installed',already_installed)
		if(already_installed){
			install_extensions()
			.then(install_complete_callback)
			.catch(install_error_callback);
		}
		else{
			create_project_files()
				.then(()=>{
					return project_package_json();
				})
				.then(()=>{
					return project_files_copy();
				})
				.then(()=>{
					return install_extensions();
				})
				.then(install_complete_callback)
				.catch(install_error_callback);
		}
	})
	.catch(install_error_callback);