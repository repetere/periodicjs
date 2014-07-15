'use strict';
var path = require('path');

module.exports = function(periodic){
	var themeController = require(path.join(__dirname,'../../../app/controller/theme'))(periodic),
			themeRouter = periodic.express.Router();

	periodic.app.use(themeRouter);
};