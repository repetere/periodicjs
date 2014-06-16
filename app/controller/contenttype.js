'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	Contenttype,
	logger;

var create = function(req, res, next) {
	if(req.controllerData.contenttype){
		applicationController.handleDocumentQueryRender({
			req:req,
			res:res,
			responseData:{
				result:"success",
				data:{
					doc:req.controllerData.contenttype
				}
			}
		});
	}
	else{
		var newcontenttype = applicationController.removeEmptyObjectValues(req.body);
		newcontenttype.name = applicationController.makeNiceName(newcontenttype.title);
		newcontenttype.author = req.user._id;

	    applicationController.createModel({
		    model:Contenttype,
		    newdoc:newcontenttype,
		    res:res,
	        req:req,
		    successredirect:'/p-admin/contenttype/edit/',
		    appendid:true
		});
	}
};

var loadContenttypes = function(req,res,next){
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// population = 'contenttypes collections authors primaryauthor',
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
		model:Contenttype,
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
				req.controllerData.contenttypes = documents;
				next();
			}
		}
	});
};

var loadContenttype = function(req,res,next){
	var params = req.params,
		docid = params.id;
		console.log("docid",docid);

	req.controllerData = (req.controllerData)?req.controllerData:{};

	applicationController.loadModel({
		docid:docid,
		model:Contenttype,
		callback:function(err,doc){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				req.controllerData.contenttype = doc;
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
					contenttypes:req.controllerData.contenttypes,
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
	Contenttype = mongoose.model('Contenttype');

	return{
		loadContenttypes:loadContenttypes,
		loadContenttype:loadContenttype,
		create:create,
		searchResults:searchResults
	};
};

module.exports = controller;