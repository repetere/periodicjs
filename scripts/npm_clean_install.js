/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

const standardExtensions = require('./standard_extensions');
const npm = require('npm');
const fs = require('fs-extra');
const path = require('path');
const promisie = require('promisie');
/**
 * This is the directory path within your project where periodic is installed into node_modules. 
 * When installing from scratch, process.cwd() refers to the original location of periodic within node modules
 * @type {[type]}
 */
var prefixpath = path.resolve(process.cwd(),'../../');//path.resolve(process.cwd());


var installStandardExtensions = function(options,callback){
	if(options.prefixpath){
		prefixpath = options.prefixpath;
	}
	console.log('npm clean_install prefixpath',prefixpath);
	try{
		let npmconfig ={
			'strict-ssl': false,
			'no-optional': true,
			'save-optional': true,
			'production': true,
			'prefix': prefixpath
		};
		npm.load(
			npmconfig,
			function (err) {
				if (err) {
					console.error(err,err.stack);
					callback(err);
				}
				else {
				 	npm['save-optional'] = true;
		 			npm['no-optional'] = true;
		 			npm['prefix'] = prefixpath;
					npm.commands.install(
						standardExtensions,
						callback
					);
				}
		});
	}
	catch(e){
		callback(e);
	}
};

var installStandardExtensionsAsync = promisie.promisify(installStandardExtensions);

exports.installStandardExtensions = installStandardExtensions;
exports.installStandardExtensionsAsync = installStandardExtensionsAsync;