'use strict';

var Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Category,
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

var loadCategories = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// population = 'categories collections authors primaryauthor',
		searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi');

	req.controllerData = (req.controllerData) ? req.controllerData : {};
	if (req.query.search === undefined || req.query.search.length < 1) {
		query = {};
	}
	else {
		query = {
			$or: [{
				title: searchRegEx
			}, {
				'name': searchRegEx
			}]
		};
	}

	CoreController.searchModel({
		model: Category,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		population: 'contenttypes parent',
		callback: function (err, documents) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.categories = documents;
				next();
			}
		}
	});
};

var loadCategory = function (req, res, next) {
	var params = req.params,
		docid = params.id;
	// console.log('docid', docid);

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
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

	return {
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
