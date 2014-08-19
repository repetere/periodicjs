'use strict';

var Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Tag,
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

var loadTags = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// population = 'tags collections authors primaryauthor',
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
		model: Tag,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		// population:population,
		callback: function (err, documents) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.tags = documents;
				next();
			}
		}
	});
};

var loadTag = function (req, res, next) {
	var params = req.params,
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		docid: docid,
		model: Tag,
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

	return {
		loadTags: loadTags,
		loadTag: loadTag,
		create: create,
		searchResults: searchResults
	};
};

module.exports = controller;
