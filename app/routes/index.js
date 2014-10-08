'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	Extensions = require('periodicjs.core.extensions'),
	themeRoute,
	themeConfig,
	themeConfigJson;

/**
 * The module that manages the express router for periodic, routes from extensions are loaded first, and then are overwritable from theme routes.
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module routes
 * @requires module:path
 * @requires module:fs
 * @requires module:periodicjs.core.extensions
 * @param {object} periodic this is the object passed from lib/periodic.js, it contains the expressjs instance, connection to mongo and others (express,app,logger,settings,db,mongoose)
 */
module.exports = function (periodic) {
	/** load mongoose models
	 * @param {object} periodic the same instance configuration object
	 */
	require('../../content/config/model')({
		mongoose: periodic.db.mongoose,
		dburl: periodic.db.url,
		debug: periodic.settings.debug,
		periodic: periodic
	});

	/** 
	 * controller for homepage
	 * @type {function}
	 */
	var homeController = require('../controller/home')(periodic),
		appRouter = periodic.express.Router(),
		ExtensionCore = new Extensions(periodic.settings);

	/** load extensions */
	periodic.settings.extconf = ExtensionCore.settings();
	ExtensionCore.loadExtensions(periodic);
	
	/** if there's a theme set in the instance configuration object, load the custom routes if they exist 
	 */
	if (periodic.settings.theme) {
		themeRoute = path.join(periodic.settings.themepath, 'routes.js');
		themeConfig = path.join(periodic.settings.themepath, 'periodicjs.theme.json');
		if (fs.existsSync(themeRoute)) {
			if(fs.existsSync(themeConfig)){
				themeConfigJson = fs.readJsonSync(themeConfig);
				periodic.settings.themeSettings = themeConfigJson;
			}
			require(themeRoute)(periodic);
		}
	}

	/**
	 * set up default routes if no routes are defined/overwritten in extensions or themes
	 */
	appRouter.get('/', homeController.default_view);
	appRouter.get('*', homeController.catch404);
	periodic.app.use(appRouter);
};