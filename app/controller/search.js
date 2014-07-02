'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	logger;

var results = function(req,res,next){
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
						title:"Search results"
					},
					searchdata: req.controllerData,
					user: applicationController.removePrivateInfo( req.user)
				}
			});
	}});
};


var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		results:results
	};
};

module.exports = controller;