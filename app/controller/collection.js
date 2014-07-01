'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	Post,
	Collection,
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
	Post.find({ title: /title/ }).exec(function(err,posts){
		console.log("model search");
		if(err){
			res.send(err);
		}
		else{
			res.send(posts);
		}
	});
};

var create = function(req, res, next) {
	var newcollection = applicationController.removeEmptyObjectValues(req.body);
	newcollection.name = applicationController.makeNiceName(newcollection.title);
	newcollection.postauthorname = req.user.username;
	newcollection.primaryauthor = req.user._id;
	newcollection.authors = [req.user._id];

    applicationController.createModel({
	    model:Collection,
	    newdoc:newcollection,
	    res:res,
        req:req,
	    successredirect:'/p-admin/collection/edit/',
	    appendid:true
	});
};

var update = function(req, res, next) {
	var updatecollection = applicationController.removeEmptyObjectValues(req.body);
	updatecollection.name = applicationController.makeNiceName(updatecollection.title);

    applicationController.updateModel({
	    model:Collection,
	    id:updatecollection.docid,
	    updatedoc:updatecollection,
	    saverevision:true,
	    population:'contenttypes',
	    res:res,
        req:req,
	    successredirect:'/p-admin/collection/edit/',
	    appendid:true
	});
};

var loadCollection = function(req,res,next){
	console.log("loadCollection");
	var params = req.params,
		population = 'tags categories authors contenttypes primaryauthor posts.post',
		docid = params.id;

	req.controllerData = (req.controllerData)?req.controllerData:{};

	applicationController.loadModel({
		docid:docid,
		model:Collection,
		population:population,
		callback:function(err,doc){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				console.log("doc",doc);
				req.controllerData.collection = doc;
				next();
			}
		}
	});
};

var loadCollections = function(req,res,next){
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'tags categories authors contenttypes primaryauthor posts.post',
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
		model:Collection,
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
				console.log(documents);
				req.controllerData.collections = documents;
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
	Collection = mongoose.model('Collection');

	return{
		show:show,
		index:index,
		create:create,
		update:update,
		loadCollection:loadCollection,
		loadCollections:loadCollections
	};
};

module.exports = controller;