'use strict';

var CoreControllerHelper = require('periodicjs.core.controllerhelper'),
	Utilities = require('periodicjs.core.utilities'),
	CoreController,
	CoreUtilities,
	appSettings,
	mongoose,
	Contenttype,
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

var loadContenttypes = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'author',
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
		model: Contenttype,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		population: population,
		callback: function (err, documents) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
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
	console.log('docid', docid);

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
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

	return {
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
