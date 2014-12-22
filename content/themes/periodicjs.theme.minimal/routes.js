'use strict';
var path = require('path');

module.exports = function(periodic){
	var themeController = periodic.app.controller.native.theme,
			itemController = periodic.app.controller.native.item,
			themeRouter = periodic.express.Router();

	// create new route to document items to post
	themeRouter.get('post/:id',itemController.loadItem,itemController.show);

	periodic.app.use(themeRouter);
	return periodic;
};