'use strict';
var path = require('path');

module.exports = function(periodic){
	var themeController = require(path.join(__dirname,'../../../app/controller/theme'))(periodic),
			itemController = require(path.join(__dirname,'../../../app/controller/item'))(periodic),
			themeRouter = periodic.express.Router();

	// create new route to document items to post
	themeRouter.get('post/:id',itemController.loadItem,itemController.show);

	periodic.app.use(themeRouter);
};