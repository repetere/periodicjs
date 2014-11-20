'use strict';

var async = require('async'),
	CoreControllerHelper = require('periodicjs.core.controller'),
	Utilities = require('periodicjs.core.utilities'),
	CoreController,
	CoreUtilities,
	appSettings,
	mongoose,
	Contenttype,
	User,
	logger;

var create = function (req, res) {
	if (req.controllerData.contenttype) {
		CoreController.handleDocumentQueryRender({
			req: req,
			res: res,
			responseData: {
				result: 'success',
				data: {
					doc: req.controllerData.contenttype
				}
			}
		});
	}
	else {
		var newcontenttype = CoreUtilities.removeEmptyObjectValues(req.body);
		newcontenttype.name = CoreUtilities.makeNiceName(newcontenttype.title);
		newcontenttype.author = req.user._id;

		CoreController.createModel({
			model: Contenttype,
			newdoc: newcontenttype,
			res: res,
			req: req,
			successredirect: '/p-admin/contenttype/edit/',
			appendid: true
		});
	}
};

var remove = function (req, res) {
	var removecontenttype = req.controllerData.contenttype,
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
			model: Contenttype,
			deleteid: removecontenttype._id,
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
						redirecturl: '/p-admin/contenttypes',
						responseData: {
							result: 'success',
							data: removecontenttype
						}
					});
				}
			}
		});
	}
};

var append = function (req, res) {
	var newattribute = CoreUtilities.removeEmptyObjectValues(req.body);
	newattribute.name = CoreUtilities.makeNiceAttribute(newattribute.title);
	var objectToModify = {
		'attributes': newattribute
	};

	CoreController.updateModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: Contenttype,
		id: req.controllerData.contenttype._id,
		updatedoc: objectToModify,
		saverevision: true,
		res: res,
		req: req,
		appendArray: true,
		successredirect: '/p-admin/contenttype/',
		appendid: true
	});
};

var removeitem = function (req, res) {
	var removeAttribute = CoreUtilities.removeEmptyObjectValues(req.body),
		objectToModify = {
			'attributes': removeAttribute
		};

	delete removeAttribute._csrf;
	console.log(removeAttribute);

	CoreController.updateModel({
		model: Contenttype,
		id: req.controllerData.contenttype._id,
		updatedoc: objectToModify,
		saverevision: true,
		res: res,
		req: req,
		removeFromArray: true,
		successredirect: '/p-admin/contenttype/',
		appendid: true
	});
};

var loadContenttypeWithCount = function (req, res, next) {
	req.headers.loadcontenttypecount = true;
	next();
};

var loadContenttypeWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.contenttypesperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getContenttypeData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.contenttypesperpage,
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
					// console.log('ctarray',ctarray);
					orQuery.push({'author':{$in:aarray}});
				}

				if(orQuery.length>0){
					query = {
						$and: orQuery
					};
				}

				parallelTask.contenttypescount = function(cb){
					if(req.headers.loadcontenttypecount){
						Contenttype.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.contenttypesquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: Contenttype,
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
							req.controllerData.contenttypes = results.contenttypesquery;
							req.controllerData.contenttypescount = results.contenttypescount;
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

var loadContenttypes = function (req, res, next) {
	var query,
		population = 'author',
		orQuery = [];

	getContenttypeData({
		req: req,
		res: res,
		next: next,
		population: population,
		query: query,
		orQuery: orQuery
	});
};

var loadContenttype = function (req, res, next) {
	var params = req.params,
		docid = params.id;
	console.log('docid', docid);

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		model: Contenttype,
		callback: function (err, doc) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.contenttype = doc;
				next();
			}
		}
	});
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
						title: 'Content Type Search Results'
					},
					contenttypes: req.controllerData.contenttypes,
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
	CoreController = new CoreControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	Contenttype = mongoose.model('Contenttype');
	User = mongoose.model('User');

	return {
		getContenttypeData: getContenttypeData,
		loadContenttypeWithDefaultLimit: loadContenttypeWithDefaultLimit,
		loadContenttypeWithCount:loadContenttypeWithCount,
		loadContenttypes: loadContenttypes,
		loadContenttype: loadContenttype,
		create: create,
		remove: remove,
		append: append,
		removeitem: removeitem,
		searchResults: searchResults
	};
};

module.exports = controller;
