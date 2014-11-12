'use strict';
var path = require('path');

module.exports = function (periodic) {
	// console.log('periodic.app.locals', periodic.app.locals);
	var readerthemeController = require('./controller/readertheme')(periodic),
		itemController = require(path.join(process.cwd(), 'app/controller/item'))(periodic),
		themeRouter = periodic.express.Router();

	periodic.app.locals.showperiodiccredit = periodic.settings.themeSettings.settings.showperiodiccredit;
	periodic.app.locals.showadminlink = periodic.settings.themeSettings.settings.showadminlink;
	periodic.app.locals.navlinks = periodic.settings.themeSettings.settings.navlinks;
	periodic.app.locals.autohidetitle = periodic.settings.themeSettings.settings.autohidetitle;
	periodic.app.locals.usecustomnav = periodic.settings.themeSettings.settings.usecustomnav;
	periodic.app.locals.customnav = periodic.settings.themeSettings.settings.customnav;

	if (periodic.settings.themeSettings.settings.navlinks === 'categories') {
		themeRouter.get('/browse/:entitytype|/browse/:entitytype/:entityitems|/author/:id|/search|/404|/notfound|/collections|/collection/:id|/collection/search|/items|/item/search|/articles|/item/:id|/', readerthemeController.loadNavCategories, readerthemeController.getNavCategories);
	}

	// require('./scripts/setup')(periodic);
	// create new route to document items to post

	themeRouter.get('/', readerthemeController.setCacheHeader, readerthemeController.homepagedata, readerthemeController.homepageindex);

	periodic.app.use(themeRouter);
};
