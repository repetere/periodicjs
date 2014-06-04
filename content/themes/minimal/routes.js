'use strict';
var path = require('path');

module.exports = function(periodic){
	var themeController = require(path.join(__dirname,'../../../app/controller/theme'))(periodic),
		themeRouter = periodic.express.Router();

	themeRouter.get('/',function(req,res){
		console.log("got minimal theme");
		res.render('home/index',{randomdata:'this is minimal home page'});
	});
	// appRouter.get('/',themeController.getPosts("mainposts",{limit:20,ids:"5,3,2,5",type:"test"}),themeController.getCollections("navCollections",{limit:50}),themeController.tagsCollections("navTags",{limit:50}),themeController.renderPage("home/index"));

	periodic.app.use(themeRouter);
};