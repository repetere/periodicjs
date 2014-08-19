'use strict';

var path = require('path'),
	fs = require('fs'),
	Extensions = require('periodicjs.core.extensions');

module.exports = function (periodic) {
	// express,app,logger,config/settings,db
	require('../../content/config/model')({
		mongoose: periodic.db.mongoose,
		dburl: periodic.db.url,
		debug: periodic.settings.debug,
		periodic: periodic
	});
	var homeController = require('../controller/home')(periodic),
		appRouter = periodic.express.Router(),
		ExtensionCore = new Extensions(periodic.settings);

	periodic.settings.extconf = ExtensionCore.settings();
	ExtensionCore.loadExtensions(periodic);
	// periodic.logger.silly(models);

	if (periodic.settings.theme) {
		var themeRoute = path.join(periodic.settings.themepath, 'routes.js');
		if (fs.existsSync(themeRoute)) {
			require(themeRoute)(periodic);
		}
	}

	/**
	 * final root routes
	 */
	appRouter.get('/', homeController.default_view);
	appRouter.get('*', homeController.catch404);
	periodic.app.use(appRouter);
};
