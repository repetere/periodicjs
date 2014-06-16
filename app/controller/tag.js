'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	Tag,
	logger;

var create = function(req, res, next) {
	if(req.controllerData.tag){
		applicationController.handleDocumentQueryRender({
			req:req,
			res:res,
			responseData:{
				result:"success",
				data:{
					doc:req.controllerData.tag
				}
			}
		});
	}
	else{
		var newtag = applicationController.removeEmptyObjectValues(req.body);
		newtag.name = applicationController.makeNiceName(newtag.title);
		newtag.author = req.user._id;

	    applicationController.createModel({
		    model:Tag,
		    newdoc:newtag,
		    res:res,
	        req:req,
		    successredirect:'/p-admin/tag/edit/',
		    appendid:true
		});
	}
};

var loadTags = function(req,res,next){
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// population = 'tags collections authors primaryauthor',
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
		model:Tag,
		query:query,
		sort:sort,
		limit:limit,
		offset:offset,
		// population:population,
		callback:function(err,documents){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				req.controllerData.tags = documents;
				next();
			}
		}
	});
};

var loadTag = function(req,res,next){
	var params = req.params,
		docid = params.id;
		console.log("docid",docid);

	req.controllerData = (req.controllerData)?req.controllerData:{};

	applicationController.loadModel({
		docid:docid,
		model:Tag,
		callback:function(err,doc){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				req.controllerData.tag = doc;
				next();
			}
		}
	});
};


var searchResults = function(req,res,next){
	applicationController.getViewTemplate({
		res:res,
		req:req,
		templatetype:'search-results',
		themepath:appSettings.themepath,
		themefileext:appSettings.templatefileextension,
		callback:function(templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:"Search Results"
					},
					tags:req.controllerData.tags,
					user: applicationController.removePrivateInfo(req.user)
				}
			});
	}});
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	Tag = mongoose.model('Tag');

	return{
		loadTags:loadTags,
		loadTag:loadTag,
		create:create,
		searchResults:searchResults
	};
};

module.exports = controller;