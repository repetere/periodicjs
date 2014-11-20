'use strict';

var async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Tag,
	User,
	logger;

var create = function (req, res) {
	if (req.controllerData.tag) {
		CoreController.handleDocumentQueryRender({
			req: req,
			res: res,
			responseData: {
				result: 'success',
				data: {
					doc: req.controllerData.tag
				}
			}
		});
	}
	else {
		var newtag = CoreUtilities.removeEmptyObjectValues(req.body);
		newtag.name = CoreUtilities.makeNiceName(newtag.title);
		newtag.author = req.user._id;

		CoreController.createModel({
			model: Tag,
			newdoc: newtag,
			res: res,
			req: req,
			successredirect: '/p-admin/tag/edit/',
			appendid: true
		});
	}
};

var update = function (req, res) {
	var updatetag = CoreUtilities.removeEmptyObjectValues(req.body);

	updatetag.name = CoreUtilities.makeNiceName(updatetag.title);

	if (updatetag.parent && updatetag.parent.length > 0 && updatetag.parent[0] === updatetag.docid) {
		updatetag.parent = [];
	}
	else if (updatetag.parent && updatetag.parent.length > 1) {
		var temptag = updatetag.parent[0];
		updatetag.parent = [];
		updatetag.parent.push(temptag);
	}

	CoreController.updateModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: Tag,
		id: updatetag.docid,
		updatedoc: updatetag,
		saverevision: false,
		population: 'contenttypes parent',
		res: res,
		req: req,
		successredirect: '/p-admin/tag/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var removetag = req.controllerData.tag,
		User = mongoose.model('User');

	if (!User.hasPrivilege(req.user, 710)) {
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('EXT-UAC710: You don\'t have access to modify content'),
			res: res,
			req: req
		});
	}
	else {
		CoreController.deleteModel({
			cached: req.headers.periodicCache !== 'no-periodic-cache',
			model: Tag,
			deleteid: removetag._id,
			req: req,
			res: res,
			callback: function (err) {
				if (err) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else {
					CoreController.handleDocumentQueryRender({
						req: req,
						res: res,
						redirecturl: '/p-admin/tags',
						responseData: {
							result: 'success',
							data: removetag
						}
					});
				}
			}
		});
	}
};

var loadTagsWithCount = function (req, res, next) {
	req.headers.loadtagcount = true;
	next();
};

var loadTagsWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.tagsperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getTagsData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.tagsperpage,
		offset = req.query.offset || (pagenum*limit),
		population = options.population,
		orQuery = options.orQuery,
		searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi'),
		parallelFilterTask = {};

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	if(req.query.ids){
		var queryIdArray=[];
		if(Array.isArray(req.query.ids)){
			queryIdArray = req.query.ids;
		}
		else if(typeof req.query.ids ==='string'){
			queryIdArray = req.query.ids.split(',');
		}
		orQuery.push({
			'_id': {$in:queryIdArray}
		});
	}
	else if (req.query.search !== undefined && req.query.search.length > 0) {
		orQuery.push({
			title: searchRegEx
		}, {
			'name': searchRegEx
		});
	}

	parallelFilterTask.authors = function(cb){
		if(req.query.filter_authors){
			var authorsArray = (typeof req.query.filter_authors==='string') ? req.query.filter_authors.split(',') : req.query.filter_authors;

			User.find({'username':{$in:authorsArray}},'_id', function( err, userids){
				cb(err, userids);
			});
		}
		else{
			cb(null,null);
		}
	};

	async.parallel(
		parallelFilterTask,
		function(err,filters){
			if(err){
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else{
				if(filters.authors){
					var aarray =[];
					for(var w in filters.authors){
						aarray.push(filters.authors[w]._id);
					}
					orQuery.push({'authors':{$in:aarray}});
				}

				if(orQuery.length>0){
					query = {
						$and: orQuery
					};
				}

				parallelTask.tagscount = function(cb){
					if(req.headers.loadtagcount){
						Tag.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.tagsquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: Tag,
						query: query,
						sort: sort,
						limit: limit,
						offset: offset,
						population: population,
						callback: function (err, documents) {
							cb(err,documents);
						}
					});
				};

				async.parallel(
					parallelTask,
					function(err,results){
						if(err){
							CoreController.handleDocumentQueryErrorResponse({
								err: err,
								res: res,
								req: req
							});
						}
						else{
							// console.log(results);
							req.controllerData.tags = results.tagsquery;
							req.controllerData.tagscount = results.tagscount;
							if(callback){
								callback(req, res);
							}
							else{
								next();								
							}
						}
				});	
			}
	});
};

var loadTags = function (req, res, next) {
	var query,
		population= 'contenttypes parent',
		orQuery = [];

	getTagsData({
		req: req,
		res: res,
		next: next,
		population: population,
		query: query,
		orQuery: orQuery
	});};

var loadTag = function (req, res, next) {
	var params = req.params,
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		model: Tag,
		population: 'contenttypes parent',
		callback: function (err, doc) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.tag = doc;
				// doc.getChildren(function (err, docwithchildren) {
				// 	console.log('===============================================================');
				// 	console.log('err', err);
				// 	console.log('docwithchildren', docwithchildren);
				// 	console.info(util.inspect(docwithchildren.childDocs[1]));
				// });
				next();
			}
		}
	});
};

var loadChildren = function (req, res, next) {
	var tag = req.controllerData.tag;
	tag.getChildren(
		function (err, tagwithchildren) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.tagwithchildren = tagwithchildren;
				next();
			}
		});
};

var showChildren = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'search/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Tag Search Results'
					},
					children: req.controllerData.tagwithchildren,
					user: CoreUtilities.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var searchResults = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'search/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Tag Search Results'
					},
					tags: req.controllerData.tags,
					user: CoreUtilities.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	Tag = mongoose.model('Tag');
	User = mongoose.model('User');

	return {
		getTagsData: getTagsData,
		loadTagsWithDefaultLimit: loadTagsWithDefaultLimit,
		loadTagsWithCount:loadTagsWithCount,
		loadTags: loadTags,
		loadTag: loadTag,
		loadChildren: loadChildren,
		showChildren: showChildren,
		create: create,
		update: update,
		remove: remove,
		searchResults: searchResults
	};
};

module.exports = controller;
