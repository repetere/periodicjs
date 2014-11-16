'use strict';
// var path = require('path');

module.exports = function (periodic) {
	var readerthemeController = require('./controller/readertheme')(periodic),
		themeRouter = periodic.express.Router(),
		envThemeSettings = periodic.settings.themeSettings.settings[periodic.settings.application.environment];

	if (periodic.settings.themeSettings) {
		periodic.app.locals.showperiodiccredit = envThemeSettings.showperiodiccredit;
		periodic.app.locals.showadminlink = envThemeSettings.showadminlink;
		periodic.app.locals.navlinks = envThemeSettings.navlinks;
		periodic.app.locals.autohidetitle = envThemeSettings.autohidetitle;
		periodic.app.locals.usecustomnav = envThemeSettings.usecustomnav;
		periodic.app.locals.customnav = envThemeSettings.customnav;
	}

	if (envThemeSettings.navlinks === 'categories') {
		themeRouter.get('/browse/:entitytype|/browse/:entitytype/:entityitems|/author/:id|/search|/404|/notfound|/collections|/collection/:id|/collection/search|/items|/item/search|/articles|/item/:id|/', readerthemeController.loadNavCategories, readerthemeController.getNavCategories);
	}

	// require('./scripts/setup')(periodic);
	// create new route to document items to post

	themeRouter.get('/', readerthemeController.setCacheHeader, readerthemeController.homepagedata, readerthemeController.homepageindex);

	periodic.app.use(themeRouter);
};
