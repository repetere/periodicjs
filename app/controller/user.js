'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	User,
	logger;

var show = function(req,res,next){
	applicationController.getViewTemplate({
		res:res,
		req:req,
		id:req.controllerData.post.name,
		templatetype:'post-single',
		themepath:appSettings.themepath,
		themefileext:appSettings.templatefileextension,
		callback:function(templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:"single post"
					},
					post:req.controllerData.post,
					user:req.user
				}
			});
	}});
};

var index = function(req,res,next){
	console.log('index list');
	User.find({ title: /title/ }).exec(function(err,posts){
		console.log("model search");
		if(err){
			res.send(err);
		}
		else{
			res.send(posts);
		}
	});
};

var loadUser = function(req,res,next){
	var params = req.params,
		docid = params.id;

	req.controllerData = (req.controllerData)?req.controllerData:{};

	applicationController.loadModel({
		docid:docid,
		model:User,
		callback:function(err,doc){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				req.controllerData.post = doc;
				next();
			}
		}
	});
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	User = mongoose.model('User');

	return{
		show:show,
		index:index,
		loadUser:loadUser
	};
};

module.exports = controller;