'use strict';

var async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Category,
	User,
	logger;

var create = function (req, res) {
	if (req.controllerData.category) {
		CoreController.handleDocumentQueryRender({
			req: req,
			res: res,
			responseData: {
				result: 'success',
				data: {
					doc: req.controllerData.category
				}
			}
		});
	}
	else {
		var newcategory = CoreUtilities.removeEmptyObjectValues(req.body);
		newcategory.name = CoreUtilities.makeNiceName(newcategory.title);
		newcategory.author = req.user._id;

		CoreController.createModel({
			model: Category,
			newdoc: newcategory,
			res: res,
			req: req,
			successredirect: '/p-admin/category/edit/',
			appendid: true
		});
	}
};

var update = function (req, res) {
	var updatecategory = CoreUtilities.removeEmptyObjectValues(req.body);

	updatecategory.name = CoreUtilities.makeNiceName(updatecategory.title);

	if (updatecategory.parent && updatecategory.parent.length > 0 && updatecategory.parent[0] === updatecategory.docid) {
		updatecategory.parent = [];
	}
	else if (updatecategory.parent && updatecategory.parent.length > 1) {
		var temptag = updatecategory.parent[0];
		updatecategory.parent = [];
		updatecategory.parent.push(temptag);
	}

	CoreController.updateModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: Category,
		id: updatecategory.docid,
		updatedoc: updatecategory,
		saverevision: false,
		population: 'contenttypes parent',
		res: res,
		req: req,
		successredirect: '/p-admin/category/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var removecategory = req.controllerData.category,
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
			model: Category,
			deleteid: removecategory._id,
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
						redirecturl: '/p-admin/categories',
						responseData: {
							result: 'success',
							data: removecategory
						}
					});
				}
			}
		});
	}
};

var loadCategoriesWithCount = function (req, res, next) {
	req.headers.loadcategorycount = true;
	next();
};

var loadCategoriesWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.categoriesperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getCategoriesData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.categoriesperpage,
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

				parallelTask.categoriescount = function(cb){
					if(req.headers.loadcategorycount){
						Category.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.categoriesquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: Category,
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
							req.controllerData.categories = results.categoriesquery;
							req.controllerData.categoriescount = results.categoriescount;
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

var loadCategories = function (req, res, next) {
	var query,
		population= 'contenttypes parent',
		orQuery = [];

	getCategoriesData({
		req: req,
		res: res,
		next: next,
		population: population,
		query: query,
		orQuery: orQuery
	});
};

var loadCategory = function (req, res, next) {
	var params = req.params,
		docid = params.id;
	// console.log('docid', docid);

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		model: Category,
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
				req.controllerData.category = doc;
				next();
			}
		}
	});
};

var loadChildren = function (req, res, next) {
	var category = req.controllerData.category;
	category.getChildren(
		function (err, categorywithchildren) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.categorywithchildren = categorywithchildren;
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
						title: 'Category Search Results'
					},
					children: req.controllerData.categorywithchildren,
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
						title: 'Category Search Results'
					},
					categories: req.controllerData.categories,
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
	Category = mongoose.model('Category');
	User = mongoose.model('User');

	return {
		getCategoriesData: getCategoriesData,
		loadCategoriesWithDefaultLimit: loadCategoriesWithDefaultLimit,
		loadCategoriesWithCount:loadCategoriesWithCount,
		loadCategories: loadCategories,
		loadCategory: loadCategory,
		loadChildren: loadChildren,
		showChildren: showChildren,
		create: create,
		update: update,
		remove: remove,
		searchResults: searchResults
	};
};

module.exports = controller;
