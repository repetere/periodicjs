'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	Contenttype,
	logger;

var create = function (req, res, next) {
	if (req.controllerData.contenttype) {
		applicationController.handleDocumentQueryRender({
			req: req,
			res: res,
			responseData: {
				result: "success",
				data: {
					doc: req.controllerData.contenttype
				}
			}
		});
	}
	else {
		var newcontenttype = applicationController.removeEmptyObjectValues(req.body);
		newcontenttype.name = applicationController.makeNiceName(newcontenttype.title);
		newcontenttype.author = req.user._id;

		applicationController.createModel({
			model: Contenttype,
			newdoc: newcontenttype,
			res: res,
			req: req,
			successredirect: '/p-admin/contenttype/edit/',
			appendid: true
		});
	}
};

var append = function (req, res, next) {
	var newattribute = applicationController.removeEmptyObjectValues(req.body);
	newattribute.name = applicationController.makeNiceAttribute(newattribute.title);
	var objectToModify = {
		"attributes": newattribute
	};

	applicationController.updateModel({
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

var removeitem = function (req, res, next) {
	var removeAttribute = applicationController.removeEmptyObjectValues(req.body),
		objectToModify = {
			"attributes": removeAttribute
		};

	delete removeAttribute._csrf;
	console.log(removeAttribute);

	applicationController.updateModel({
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

var loadContenttypes = function (req, res, next) {
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'author',
		searchRegEx = new RegExp(applicationController.stripTags(req.query.search), "gi");

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

	applicationController.searchModel({
		model: Contenttype,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		population: population,
		callback: function (err, documents) {
			if (err) {
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.contenttypes = documents;
				next();
			}
		}
	});
};

var loadContenttype = function (req, res, next) {
	var params = req.params,
		docid = params.id;
	console.log("docid", docid);

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	applicationController.loadModel({
		docid: docid,
		model: Contenttype,
		callback: function (err, doc) {
			if (err) {
				applicationController.handleDocumentQueryErrorResponse({
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
						title: "Content Type Search Results"
					},
					contenttypes: req.controllerData.contenttypes,
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
	Contenttype = mongoose.model('Contenttype');

	return {
		loadContenttypes: loadContenttypes,
		loadContenttype: loadContenttype,
		create: create,
		append: append,
		removeitem: removeitem,
		searchResults: searchResults
	};
};

module.exports = controller;
