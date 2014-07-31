'use strict';

var path = require('path'),
	moment = require('moment'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	Item,
	logger;

var show = function (req, res, next) {
	applicationController.getPluginViewDefaultTemplate({
			viewname: 'item/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			applicationController.handleDocumentQueryRender({
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

var index = function (req, res, next) {
	applicationController.getPluginViewDefaultTemplate({
			viewname: 'item/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			applicationController.handleDocumentQueryRender({
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

var create = function (req, res, next) {
	var newitem = applicationController.removeEmptyObjectValues(req.body);
	newitem.name = applicationController.makeNiceName(newitem.title);
	newitem.itemauthorname = req.user.username;
	newitem.primaryauthor = req.user._id;
	newitem.authors = [req.user._id];
	if (newitem.date && newitem.time) {
		newitem.publishat = new Date(moment(newitem.date + ' ' + newitem.time).format());
	}

	// console.log(newitem);
	applicationController.createModel({
		model: Item,
		newdoc: newitem,
		res: res,
		req: req,
		successredirect: '/p-admin/item/edit/',
		appendid: true
	});
};

var update = function (req, res, next) {
	var updateitem = applicationController.removeEmptyObjectValues(req.body);

	updateitem.name = applicationController.makeNiceName(updateitem.title);
	if (!updateitem.primaryasset && updateitem.assets && updateitem.assets.length > 0) {
		updateitem.primaryasset = updateitem.assets[0];
	}
	if (updateitem.date && updateitem.time) {
		updateitem.publishat = new Date(moment(updateitem.date + ' ' + updateitem.time).format());
	}

	applicationController.updateModel({
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

var loadItem = function (req, res, next) {
	var params = req.params,
		population = 'contenttypes primaryauthor authors',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	applicationController.loadModel({
		docid: docid,
		population: population,
		model: Item,
		callback: function (err, doc) {
			if (err) {
				applicationController.handleDocumentQueryErrorResponse({
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
				applicationController.handleDocumentQueryErrorResponse({
					err: new Error("invalid document request"),
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

	applicationController.loadModel({
		docid: docid,
		model: Item,
		population: 'tags collections contenttypes categories assets primaryasset authors primaryauthor',
		callback: function (err, doc) {
			if (err) {
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.item = doc;
				next();
			}
		}
	});
};

var loadItems = function (req, res, next) {
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'tags categories authors contenttypes primaryasset primaryauthor',
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
		model: Item,
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
	applicationController = new appController(resources);
	Item = mongoose.model('Item');

	return {
		show: show,
		index: index,
		create: create,
		update: update,
		loadItem: loadItem,
		loadFullItem: loadFullItem,
		loadItems: loadItems
	};
};

module.exports = controller;
