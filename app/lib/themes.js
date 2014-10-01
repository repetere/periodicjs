/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var path = require('path'),
	logger;
/**
 * A module that represents a theme manager.
 * @{@link https://github.com/typesettin/periodic}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module themes
 * @param {object} appsettings reference to periodic instance
 * @requires module:path
 * @todo to do later
 */
var themes = function (appsettings) {
	logger = appsettings.logger;
};

/** get the file path of the theme router
 * @param {string} themeName get the file path to the theme route file
 * @returns {string} file path for theme route file
 */
themes.getThemeRouteFilePath = function (themeName) {
	return path.join(path.resolve(__dirname, '../../content/themes/', themeName), 'routes.js');
};


/** get the file path of the theme config json
 * @param {string} themeName get the file path to the theme json config file
 * @returns {string} file path for theme config file
 */
themes.getThemePeriodicConfFilePath = function (themeName) {
	return path.join(path.resolve(__dirname, '../../content/themes/', themeName), 'periodicjs.theme.json');
};

module.exports = themes;
