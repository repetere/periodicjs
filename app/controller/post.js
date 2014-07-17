'use strict';

var path = require('path'),
	moment = require('moment'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	Post,
	logger;

var show = function(req,res,next){
	applicationController.getPluginViewDefaultTemplate(
		{
			viewname:'documentpost/show',
			themefileext:appSettings.templatefileextension
		},
		function(err,templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:req.controllerData.post.title
					},
					post:req.controllerData.post,
					user:req.user
				}
			});
		}
	);
};

var index = function(req,res,next){
	applicationController.getPluginViewDefaultTemplate(
		{
			viewname:'documentpost/index',
			themefileext:appSettings.templatefileextension
		},
		function(err,templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:'Articles'
					},
					posts:req.controllerData.posts,
					user:req.user
				}
			});
		}
	);
};

var create = function(req, res, next) {
	var newpost = applicationController.removeEmptyObjectValues(req.body);
			newpost.name = applicationController.makeNiceName(newpost.title);
			newpost.postauthorname = req.user.username;
			newpost.primaryauthor = req.user._id;
			newpost.authors = [req.user._id];
			if(newpost.date && newpost.time){
				newpost.publishat = new Date(moment(newpost.date+' '+newpost.time).format());
			}

	// console.log(newpost);
	applicationController.createModel({
	  model:Post,
	  newdoc:newpost,
	  res:res,
    req:req,
	  successredirect:'/p-admin/post/edit/',
	  appendid:true
	});
};

var update = function(req, res, next) {
	var updatepost = applicationController.removeEmptyObjectValues(req.body);

	updatepost.name = applicationController.makeNiceName(updatepost.title);
	if(!updatepost.primaryasset && updatepost.assets && updatepost.assets.length>0){
		updatepost.primaryasset = updatepost.assets[0];
	}
	if(updatepost.date && updatepost.time){
		updatepost.publishat = new Date(moment(updatepost.date+' '+updatepost.time).format());
	}

	applicationController.updateModel({
		model:Post,
		id:updatepost.docid,
		updatedoc:updatepost,
		saverevision:true,
		population:'contenttypes',
		res:res,
		  req:req,
		successredirect:'/p-admin/post/edit/',
		appendid:true
	});
};

var loadItem = function(req,res,next){
	var params = req.params,
		population = 'contenttypes primaryauthor authors',
		docid = params.id;

	req.controllerData = (req.controllerData)?req.controllerData:{};

	applicationController.loadModel({
		docid:docid,
		population:population,
		model:Post,
		callback:function(err,doc){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else if(doc){
				req.controllerData.post = doc;
				next();
			}
			else{
				applicationController.handleDocumentQueryErrorResponse({
					err:new Error("invalid document request"),
					res:res,
					req:req
				});
			}
		}
	});
};

var loadFullItem = function(req,res,next){
	var params = req.params,
		docid = params.id;

	req.controllerData = (req.controllerData)?req.controllerData:{};

	applicationController.loadModel({
		docid:docid,
		model:Post,
		population:'tags collections contenttypes categories assets primaryasset authors primaryauthor',
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

var loadItems = function(req,res,next){
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'tags categories authors contenttypes primaryasset primaryauthor',
		searchRegEx = new RegExp(applicationController.stripTags(req.query.search), "gi");

	req.controllerData = (req.controllerData)?req.controllerData:{};
	if(req.query.search===undefined || req.query.search.length<1){
		query={};
	}
	else{
		query = {
			$or: [{
				title: searchRegEx,
				}, {
				'name': searchRegEx,
			}]
		};
	}

	applicationController.searchModel({
		model:Post,
		query:query,
		sort:sort,
		limit:limit,
		offset:offset,
		population:population,
		callback:function(err,documents){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				req.controllerData.posts = documents;
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
	Post = mongoose.model('Post');

	return{
		show:show,
		index:index,
		create:create,
		update:update,
		loadItem:loadItem,
		loadFullItem:loadFullItem,
		loadItems:loadItems
	};
};

module.exports = controller;