/*
 * periodicjs
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2016 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var path = require('path'),
	// request = require('superagent'),
	async = require('async'),
	fs = require('fs-extra'),
	npm = require('npm'),
	CronJob = require('cron').CronJob,
	semver = require('semver'),
	admin_ext_settings,
	logger,
	appSettings;

var checkOutdatedModulesAndPeriodic = function (options, callback) {
	var list_of_extensions;
	var list_of_extensions_recent_data;
	var list_of_extensions_current_data = {};
	var list_of_extensions_outdated_data = {};
	var periodic_outdated_log_file_path = path.resolve(process.cwd(), 'content/config/outdated_log.json'),
		npmconfig = {
			'strict-ssl': false,
			'save-optional': true,
			'silent': true,
			'json': true,
			'production': true
		};

	async.series({
		get_list_of_extensions: function (asyncCB) {
			// console.log('appSettings',appSettings)
			list_of_extensions = appSettings.extconf.extensions.map(function (ext) {
				return ext.name;
			});
			list_of_extensions.push('periodicjs');
			appSettings.extconf.extensions.forEach(function (ext) {
				var returnobj = {};
				list_of_extensions_current_data[ext.name] = {
					name: ext.name,
					installed_version: ext.version
				};

				return returnobj;
			});
			fs.readJSON(path.resolve(process.cwd(), 'package.json'), function (err, jsondata) {
				list_of_extensions_current_data.periodicjs = {
					name: jsondata.name,
					installed_version: jsondata.version
				};
				asyncCB(err, list_of_extensions_current_data);
			});
		},
		ensure_outdated_log: function (asyncCB) {
			fs.ensureFile(periodic_outdated_log_file_path, asyncCB);
		},
		get_latest_version_numbers: function (asyncCB) {
			npm.silent = true;
			npm.load(
				npmconfig,
				function (err) {
					if (err) {
						asyncCB(err);
					}
					else {
						npm.silent = true;
						async.each(list_of_extensions,
							function (item, mapCB) {
								npm.commands.view(
									[item, 'name', 'version'],
									function (err, data) {
										if (err) {
											mapCB(err);
										}
										else {
											// var returnobj={};
											var returnobjkey = Object.keys(data)[0];
											list_of_extensions_current_data[data[returnobjkey].name].latest_version = data[returnobjkey].version;
											mapCB(null);
										}
									}
								);
							},
							function (err, results) {
								// results is now an array of stats for each file
								list_of_extensions_recent_data = results;
								asyncCB(err, results);
							});

					}
				});
		},
		calculate_outdated_versions: function (asyncCB) {
			for (var key in list_of_extensions_current_data) {
				if (semver.lt(list_of_extensions_current_data[key].installed_version, list_of_extensions_current_data[key].latest_version)) {
					list_of_extensions_outdated_data[key] = list_of_extensions_current_data[key];
				}
			}
			asyncCB(null, list_of_extensions_outdated_data);
		}
	}, function (err, result) {
		if (err) {
			logger.error(err);
			if (callback) {
				callback(err);
			}
		}
		else if (result.calculate_outdated_versions && Object.keys(result.calculate_outdated_versions).length > 0) {
			if (callback) {
				callback(null, result);
			}
			logger.warn('asyncadmin - WARNING: Your Instance is out of date', result.calculate_outdated_versions);
			fs.writeJson(periodic_outdated_log_file_path, result);
		}
	});
};

var useCronTasks = function () {
	checkOutdatedModulesAndPeriodic();
	try {
		var crontime_to_use = (admin_ext_settings && admin_ext_settings.settings && admin_ext_settings.settings.check_dependency_cron) ? admin_ext_settings.settings.check_dependency_cron : '00 00 06 * * 1-5',
			check_outdated_dependencies = new CronJob({
				cronTime: crontime_to_use,
				onTick: checkOutdatedModulesAndPeriodic,
				onComplete: function () {} //,
					// start: true
			});
		check_outdated_dependencies.start();
	}
	catch (e) {
		logger.error('setupLoanCronTasks e', e);
	}
};


var extension_helper = function (resources) {
	logger = resources.logger;
	appSettings = resources.settings;
	admin_ext_settings = (resources.app.controller.extension.asyncadmin && resources.app.controller.extension.asyncadmin.adminExtSettings) ? resources.app.controller.extension.asyncadmin.adminExtSettings : {};

	return {
		checkOutdatedModulesAndPeriodic: checkOutdatedModulesAndPeriodic,
		useCronTasks: useCronTasks
	};
};

module.exports = extension_helper;
