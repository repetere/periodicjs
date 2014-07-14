'use strict';

var path = require('path'),
	fs = require('fs'),
	ExtentionLoader = require('../lib/extensions');

module.exports = function(periodic){
	// express,app,logger,config/settings,db
	var models = require('../../content/config/model')({
			mongoose : periodic.db.mongoose,
			dburl: periodic.db.url,
			debug: periodic.settings.debug,
			periodic:periodic
		}),
		homeController = require('../controller/home')(periodic),
		appRouter = periodic.express.Router(),
		extensions = new ExtentionLoader(periodic.settings);

	periodic.settings.extconf =extensions.settings();
	extensions.loadExtensions(periodic);

	if(periodic.settings.theme){
		var themeRoute = path.join(periodic.settings.themepath,'routes.js');
		if(fs.existsSync(themeRoute)){
			require(themeRoute)(periodic);
		}
	}

	/**
	 * final root routes
	 */
	appRouter.get('/',homeController.default_view);
	appRouter.get('*',homeController.catch404);
	periodic.app.use(appRouter);
};