'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	logger;

var index = function(req,res,next){
	applicationController.getViewTemplate({
		res:res,
		req:req,
		templatetype:'home-index',
		themepath:appSettings.themepath,
		themefileext:appSettings.templatefileextension,
		callback:function(templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:"homepage"
					},
					user:req.user
				}
			});
	}});
};
var error404 = function(req,res,next){
	res.status(404);
	applicationController.getViewTemplate({
		res:res,
		req:req,
		templatetype:'home-404',
		themepath:appSettings.themepath,
		themefileext:appSettings.templatefileextension,
		callback:function(templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:"Not Found"
					},
					user:req.user,
					url:req.url
				}
			});
	}});
};

var catch404 = function(req, res, next){
	var err = new Error("Page not found");
	// next(err);

	applicationController.handleDocumentQueryErrorResponse({err:err,req:req,res:res,errorflash:err.message+", "+req.url});
  //   if (err) {
		// res.status(404);

		// // respond with html page
		// if (req.accepts('html')) {
		// 	error404(req, res, next);
		// 	return;
		// }
		// else if (req.accepts('json')) {
		// 	// respond with json
		//     res.send({ error: 'Not found' });
		//     return;
		// }
		// else{
		// 	// default to plain-text. send()
		// 	res.type('txt').send('Not found');
		// }
  //   }
  //   else{
		// next(err);
  //   }
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		index:index,
		error404:error404,
		catch404:catch404
	};
};

module.exports = controller;