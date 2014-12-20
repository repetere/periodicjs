'use strict';
var path = require('path');

module.exports = function(periodic){
	var themeController = periodic.app.controller.native.theme,
			themeRouter = periodic.express.Router();

	periodic.app.use(themeRouter);
	return periodic;
};