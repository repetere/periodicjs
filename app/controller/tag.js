'use strict';

var Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	util = require('util'),
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

	return {
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
