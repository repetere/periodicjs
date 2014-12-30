'use strict';
// var path = require('path');

module.exports = function (periodic) {
	// var 
	// 		itemController = periodic.app.controller.native.item,
	var themeController = periodic.app.controller.native.theme,
		themeRouter = periodic.express.Router(),
		envThemeSettings = periodic.settings.themeSettings.settings[periodic.settings.application.environment];

	if (periodic.settings.themeSettings) {
		periodic.app.locals.showperiodiccredit = envThemeSettings.showperiodiccredit;
		periodic.app.locals.showadminlink = envThemeSettings.showadminlink;
		periodic.app.locals.navlinks = envThemeSettings.navlinks;
		periodic.app.locals.autohidetitle = envThemeSettings.autohidetitle;
		periodic.app.locals.usecustomnav = envThemeSettings.usecustomnav;
		periodic.app.locals.customnav = envThemeSettings.customnav;
		periodic.app.locals.usecustomfooter = envThemeSettings.usecustomfooter;
		periodic.app.locals.customfooter = envThemeSettings.customfooter;
	}

	if (envThemeSettings.navlinks === 'categories') {
		themeRouter.get('/browse/:entitytype|/browse/:entitytype/:entityitems|/author/:id|/search|/404|/notfound|/collections|/collection/:id|/collection/search|/items|/item/search|/articles|/item/:id|/', themeController.loadNavCategories, themeController.getNavCategories);
	}
	// // create new route to document items to post
	themeRouter.get('/', themeController.setCacheHeader, themeController.homepagedata, themeController.homepageindex);


	periodic.app.use(themeRouter);
	return periodic;
};
