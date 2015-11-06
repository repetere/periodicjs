'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	Extensions = require('periodicjs.core.extensions'),
	Utilities = require('periodicjs.core.utilities'),
	Controllers = require('periodicjs.core.controller'),
	ControllerSettings = require('../controller/controller_settings'),
	CoreMailer = require('periodicjs.core.mailer'),
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
	var themeRouteTest,
		appRouter = periodic.express.Router(),
		ignoreExtensionIndex;//,
		// templatefileextension = periodic.settings.templatefileextension;
	/** load mongoose models
	 * @param {object} periodic the same instance configuration object
	 */
	require('../../content/config/model')({
		mongoose: periodic.db.mongoose,
		dburl: periodic.db.url,
		dboptions: periodic.db.mongooptions,
		debug: periodic.settings.debug,
		periodic: periodic
	});

	/** if there's a theme set in the instance configuration object, load theme settings 
	 */
	if (periodic.settings.theme) {
		themeRoute = path.join(periodic.settings.themepath, 'routes.js');
		themeConfig = path.join(__dirname, '../../content/config/themes',periodic.settings.theme, 'periodicjs.theme.json');
		themeRouteTest=fs.existsSync(themeRoute);
		if (themeRouteTest) {
			if(fs.existsSync(themeConfig)){
				themeConfigJson = fs.readJsonSync(themeConfig);
				periodic.settings.themeSettings = themeConfigJson;
			}
		}
	}

	if(periodic.settings.use_test_extensions_by_environment){
		periodic.settings.extensionFilePath = path.resolve(__dirname, '../../content/config/process/'+periodic.settings.application.environment+'.extensions.json');
	}

	/**
	 * periodic core
	 */
	periodic.core = {
		controller: new Controllers(periodic),
		utilities: new Utilities(periodic)
	};
	periodic.core.extension = new Extensions(periodic);
	periodic.core.extension.mailer = CoreMailer;
	periodic.core.mailer = CoreMailer;

	/**
	 * periodic controllers
	 * @type {Object}
	 */
	periodic.app.controller = {
		native:{
			asset: require('../controller/asset')(periodic),
			category: periodic.core.controller.controller_routes(ControllerSettings.category),
			collection: periodic.core.controller.controller_routes(ControllerSettings.collection),
			compilation: periodic.core.controller.controller_routes(ControllerSettings.compilation),
			contenttype: require('../controller/contenttype')(periodic),
			extension: require('../controller/extension')(periodic),
			home: require('../controller/home')(periodic),
			item: periodic.core.controller.controller_routes(ControllerSettings.item),
			data: periodic.core.controller.controller_routes(ControllerSettings.data),
			search: require('../controller/search')(periodic),
			tag:  periodic.core.controller.controller_routes(ControllerSettings.tag),
			theme: require('../controller/theme')(periodic),
			userrole: periodic.core.controller.controller_routes(ControllerSettings.userrole),
			userprivilege: periodic.core.controller.controller_routes(ControllerSettings.userprivilege),
			user: periodic.core.controller.controller_routes(ControllerSettings.user),
			ControllerSettings: ControllerSettings//require('../controller/user')(periodic)
		},
		extension:{ }
	};
	// console.log('periodic.app.controller.native.user',periodic.app.controller.native.user);
	// console.log('	periodic.app.controller.native.tag',periodic.app.controller.native.tag);
	/** 
	 * controller for homepage
	 * @type {function}
	 */
	// console.log('routes periodic.core',periodic.core);

	/** load extensions */
	periodic.settings.extconf = periodic.core.extension.settings();
	periodic.ignoreExtension = 'periodicjs.ext.default_routes';
	periodic = periodic.core.extension.loadExtensions(periodic);
	ignoreExtensionIndex = periodic.ignoreExtensionIndex;
	// console.log('ignoreExtensionIndex',ignoreExtensionIndex);
	// console.log('routes after ext periodic.core',periodic.core);
	
	/** load custom theme routes */
	if (themeRouteTest) {
		periodic = periodic.core.extension.loadExtensionRoute(themeRoute,periodic);
	}

	/**
	 * load default routes last if enabled
	 */
	if(typeof ignoreExtensionIndex !== 'undefined'){
		periodic = periodic.core.extension.loadExtensionRoute(periodic.core.extension.files()[ignoreExtensionIndex],periodic);
	}

	/**
	 * set up default routes if no routes are defined/overwritten in extensions or themes
	 */
	appRouter.get('/', periodic.app.controller.native.home.default_view);
	appRouter.get('*', periodic.app.controller.native.home.catch404);
	periodic.app.use(appRouter);
	return periodic;
};