'use strict';

module.exports = function (periodic) {
	var themeController = periodic.app.controller.native.theme,
		themeRouter = periodic.express.Router(),
		envThemeSettings;

	if (periodic.settings.themeSettings && periodic.settings.themeSettings.settings) {
		envThemeSettings = periodic.settings.themeSettings.settings[periodic.settings.application.environment];

		periodic.app.locals.showperiodiccredit = envThemeSettings.showperiodiccredit;
		periodic.app.locals.showadminlink = envThemeSettings.showadminlink;
		periodic.app.locals.navlinks = envThemeSettings.navlinks;
		periodic.app.locals.autohidetitle = envThemeSettings.autohidetitle;
		periodic.app.locals.usecustomnav = envThemeSettings.usecustomnav;
		periodic.app.locals.customnav = envThemeSettings.customnav;
		periodic.app.locals.usecustomfooter = envThemeSettings.usecustomfooter;
		periodic.app.locals.customfooter = envThemeSettings.customfooter;
	}

	if (envThemeSettings && envThemeSettings.navlinks === 'categories') {
		themeRouter.get('/browse/:entitytype|/browse/:entitytype/:entityitems|/author/:id|/search|/404|/notfound|/collections|/collection/:id|/collection/search|/items|/item/search|/articles|/item/:id|/', themeController.loadNavCategories, themeController.getNavCategories);
	}
	// create new route to document items to post
	themeRouter.get('/', themeController.setCacheHeader, themeController.homepagedata, themeController.homepageindex);

	periodic.app.use(themeRouter);
	return periodic;
};