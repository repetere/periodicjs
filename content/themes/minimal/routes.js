'use strict';
var path = require('path');

module.exports = function(periodic){
	var themeController = require(path.join(__dirname,'../../../app/controller/theme'))(periodic),
		themeRouter = periodic.express.Router(),
		homeController = require('../../../app/controller/home')(periodic);

	themeRouter.get('/',homeController.index);
	// appRouter.get('/',themeController.getPosts("mainposts",{limit:20,ids:"5,3,2,5",type:"test"}),themeController.getCollections("navCollections",{limit:50}),themeController.tagsCollections("navTags",{limit:50}),themeController.renderPage("home/index"));
	themeRouter.get('/feature/:cat/:post',function(req,res,next){
		themeController.customLayout({
			viewtype:'theme',
			viewpath:'feature/index',
			req:req,
			res:res,
			next:false,
			pagedata:{
				nav:{
					model:'Category',
					search:{
						query:req.params.cat,sort:'-createdat',limit:1,offset:0
					}
				},
				page:{
					model:'Post',
					search:{
						query:req.params.post,sort:'-createdat',limit:1,offset:0
					}
				}
			}
		});
	});

	periodic.app.use(themeRouter);
};