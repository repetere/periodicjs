'use strict';

var moment = require('moment'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	str2json = require('string-to-json'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Item,
	logger;

var show = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'item/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.item.title
					},
					item: req.controllerData.item,
					user: req.user
				}
			});
		}
	);
};

var index = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'item/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Articles'
					},
					items: req.controllerData.items,
					user: req.user
				}
			});
		}
	);
};

var create = function (req, res) {
	var newitem = CoreUtilities.removeEmptyObjectValues(req.body);
	newitem.name = (newitem.name) ? newitem.name : CoreUtilities.makeNiceName(newitem.title);
	newitem.itemauthorname = req.user.username;
	newitem.primaryauthor = req.user._id;
	newitem.authors = [req.user._id];
	if (newitem.date && newitem.time) {
		newitem.publishat = new Date(moment(newitem.date + ' ' + newitem.time).format());
	}

	newitem = str2json.convert(newitem);
	CoreController.createModel({
		model: Item,
		newdoc: newitem,
		res: res,
		req: req,
		successredirect: '/p-admin/item/edit/',
		appendid: true
	});
};

var update = function (req, res) {
	var updateitem = CoreUtilities.removeEmptyObjectValues(req.body);

	updateitem.name = (updateitem.name) ? updateitem.name : CoreUtilities.makeNiceName(updateitem.title);
	if (!updateitem.primaryasset && updateitem.assets && updateitem.assets.length > 0) {
		updateitem.primaryasset = updateitem.assets[0];
	}
	if (updateitem.date && updateitem.time) {
		updateitem.publishat = new Date(moment(updateitem.date + ' ' + updateitem.time).format());
	}
	updateitem = str2json.convert(updateitem);

	CoreController.updateModel({
		model: Item,
		id: updateitem.docid,
		updatedoc: updateitem,
		saverevision: true,
		population: 'contenttypes',
		res: res,
		req: req,
		successredirect: '/p-admin/item/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var removeitem = req.controllerData.item,
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
			model: Item,
			deleteid: removeitem._id,
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
						redirecturl: '/p-admin/items',
						responseData: {
							result: 'success',
							data: 'deleted'
						}
					});
				}
			}
		});
	}
};

var loadFullItemData = function (req, res, err, doc, next, callback) {
	if (err) {
		CoreController.handleDocumentQueryErrorResponse({
			err: err,
			res: res,
			req: req
		});
	}
	else if (doc) {
		req.controllerData.item = doc;
		if (callback) {
			callback(req, res);
		}
		else {
			next();
		}
	}
	else {
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('invalid document request'),
			res: res,
			req: req
		});
	}
};

var loadItem = function (req, res, next) {
	var params = req.params,
		population = 'contenttypes primaryauthor authors',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		docid: docid,
		population: population,
		model: Item,
		callback: function (err, doc) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (doc) {
				req.controllerData.item = doc;
				next();
			}
			else {
				CoreController.handleDocumentQueryErrorResponse({
					err: new Error('invalid document request'),
					res: res,
					req: req
				});
			}
		}
	});
};

var loadFullItem = function (req, res, next) {
	var params = req.params,
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		docid: docid,
		model: Item,
		population: 'tags collections contenttypes categories assets primaryasset authors primaryauthor',
		callback: function (err, doc) {
			loadFullItemData(req, res, err, doc, next, null);
		}
	});
};

var loadItems = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'tags categories authors contenttypes primaryasset primaryauthor',
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
		model: Item,
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
				req.controllerData.items = documents;
				next();
			}
		}
	});
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	Item = mongoose.model('Item');

	return {
		show: show,
		index: index,
		create: create,
		update: update,
		remove: remove,
		loadFullItemData: loadFullItemData,
		loadItem: loadItem,
		loadFullItem: loadFullItem,
		loadItems: loadItems
	};
};

module.exports = controller;
