'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	Category,
	logger;

var create = function (req, res, next) {
	if (req.controllerData.category) {
		applicationController.handleDocumentQueryRender({
			req: req,
			res: res,
			responseData: {
				result: "success",
				data: {
					doc: req.controllerData.category
				}
			}
		});
	}
	else {
		var newcategory = applicationController.removeEmptyObjectValues(req.body);
		newcategory.name = applicationController.makeNiceName(newcategory.title);
		newcategory.author = req.user._id;

		applicationController.createModel({
			model: Category,
			newdoc: newcategory,
			res: res,
			req: req,
			successredirect: '/p-admin/category/edit/',
			appendid: true
		});
	}
};

var loadCategories = function (req, res, next) {
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// population = 'categories collections authors primaryauthor',
		searchRegEx = new RegExp(applicationController.stripTags(req.query.search), "gi");

	req.controllerData = (req.controllerData) ? req.controllerData : {};
	if (req.query.search === undefined || req.query.search.length < 1) {
		query = {};
	}
	else {
		query = {
			$or: [{
				title: searchRegEx,
			}, {
				'name': searchRegEx,
			}]
		};
	}

	applicationController.searchModel({
		model: Category,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		// population:population,
		callback: function (err, documents) {
			if (err) {
				applicationController.handleDocumentQueryErrorResponse({
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
	console.log("docid", docid);

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	applicationController.loadModel({
		docid: docid,
		model: Category,
		callback: function (err, doc) {
			if (err) {
				applicationController.handleDocumentQueryErrorResponse({
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


var searchResults = function (req, res, next) {
	applicationController.getPluginViewDefaultTemplate({
			viewname: 'search/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			applicationController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: "Category Search Results"
					},
					categories: req.controllerData.categories,
					user: applicationController.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	Category = mongoose.model('Category');

	return {
		loadCategories: loadCategories,
		loadCategory: loadCategory,
		create: create,
		searchResults: searchResults
	};
};

module.exports = controller;
