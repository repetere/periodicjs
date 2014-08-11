/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
	semver = require('semver'),
	path = require('path');
/**
 * A module that represents a extension manager.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module config
 * @requires module:fs
 * @requires module:util-extent
 * @throws {Error} If missing configuration files
 * @todo to do later
 */
var extensionFilePath = path.join(path.resolve(__dirname, '../../content/extensions/'), 'extensions.json');

var Extensions = function (appsettings) {
	var extensionsConfig = {},
		extensionsFiles = [];

	/** 
	 * gets the configuration information
	 * @return { string } file path for config file
	 */
	this.settings = function () {
		return extensionsConfig;
	};

	this.files = function () {
		return extensionsFiles;
	};

	this.savePluginConfig = function (name, value) {
		this[name] = value;
	}.bind(this);

	this.getExtensionFilePath = function (extensionName) {
		return path.join(path.resolve(process.cwd(), './node_modules/', extensionName), 'index.js');
	};

	this.getExtensionPeriodicConfFilePath = function (extensionName) {
		return path.join(path.resolve(process.cwd(), './node_modules/', extensionName), 'periodicjs.ext.json');
	};

	this.loadExtensions = function (obj) {
		extensionsFiles.forEach(function (file) {
			require(file)(obj);
		});
	}.bind(this);

	/** 
	 * loads app configuration
	 * @throws {Error} If missing config file
	 */
	this.init = function (appsettings) {
		// /** load pluginfile: content/plugin/extensions.json */
		extensionsConfig = fs.readJSONSync(extensionFilePath);
		extensionsConfig.extensions.forEach(function (val) {
			// extensionsConfig.extensions.forEach(function (val, index, arr) {
			// if(val.installed){
			// 	// console.log(this.getExtensionPeriodicConfFilePath(val.name));
			// 	val.periodicConfig = readJSONFile(this.getExtensionPeriodicConfFilePath(val.name));
			// }
			try {
				if (semver.lte(val.periodicCompatibility, appsettings.version) && val.enabled) {
					extensionsFiles.push(this.getExtensionFilePath(val.name));
				}
			}
			catch (e) {
				throw new Error('Invalid Extension Configuration');
			}
		}.bind(this));
	}.bind(this);

	this.init(appsettings);
};

Extensions.prototype.getExtensionConfFilePath = function(){
	return extensionFilePath;
};

// extensions.readJSONFileAsync = function (filename, callback) {
// 	fs.readFile(filename, function (err, data) {
// 		if (err) {
// 			callback(err, null);
// 		}
// 		else {
// 			try {
// 				callback(null, JSON.parse(data));
// 			}
// 			catch (e) {
// 				callback(e, null);
// 			}
// 		}
// 	});
// 	return JSON.parse(fs.readFileSync(filename));
// };

Extensions.prototype.getExtensionFilePath = function (extensionName) {
	return path.join(path.resolve(process.cwd(), './node_modules/', extensionName), 'index.js');
};

Extensions.prototype.getExtensionPackageJsonFilePath = function (extensionName) {
	return path.join(path.resolve(process.cwd(), './node_modules/', extensionName), 'package.json');
};

Extensions.prototype.getExtensionPeriodicConfFilePath = function (extensionName) {
	return path.join(path.resolve(process.cwd(), './node_modules/', extensionName), 'periodicjs.ext.json');
};

Extensions.prototype.installPublicDirectory = function (options,callback) {
	var extname = options.extname,
		extdir = path.resolve(process.cwd(), './node_modules/', extname, 'public'),
		extpublicdir = path.resolve(process.cwd(), './public/extensions/', extname);
	// console.log("extname",extname);
	// fs.readdir(extdir, function (err, files) {
	fs.readdir(extdir, function (err) {
		// console.log("files",files);
		if (err) {
			callback(err,null);
		}
		else {
			//make destination dir
			fs.mkdirs(extpublicdir, function (err) {
				if (err) {
					callback(err,null);
				}
				else {
					fs.copy(extdir, extpublicdir, function (err) {
						if (err) {
							callback(err,null);
						}
						else {
							callback(null,'Copied public files');
						}
					});
				}
			});
		}
	});
};

module.exports = Extensions;
