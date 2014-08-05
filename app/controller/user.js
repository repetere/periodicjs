'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	User,
	logger;

var show = function (req, res, next) {
	applicationController.getPluginViewDefaultTemplate({
			viewname: 'author/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			applicationController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.user.username
					},
					author: applicationController.removePrivateInfo(req.controllerData.user),
					user: applicationController.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var index = function (req, res) {
	console.log('index list');
	User.find({
		title: /title/
	}).exec(function (err, items) {
		console.log('model search');
		if (err) {
			res.send(err);
		}
		else {
			res.send(items);
		}
	});
};

var update = function (req, res) {
	var updateuser = applicationController.removeEmptyObjectValues(req.body);
	// updateuser.name = applicationController.makeNiceName(updateuser.title);
	// if (updateuser.items && updateuser.items.length > 0) {
	// 	for (var x in updateuser.items) {
	// 		updateuser.items[x] = JSON.parse(updateuser.items[x]);
	// 	}
	// }
	if (!updateuser.primaryasset && updateuser.assets && updateuser.assets.length > 0) {
		updateuser.primaryasset = updateuser.assets[0];
	}

	applicationController.updateModel({
		model: User,
		id: updateuser.docid,
		updatedoc: updateuser,
		// saverevision: true,
		// population: 'contenttypes',
		res: res,
		req: req,
		successredirect: '/p-admin/user/' + updateuser.username + '/edit/',
		appendid: true
	});
};

var loadUser = function (req, res, next) {
	var params = req.params,
		population = 'userassets coverimages userasset coverimage extensionattributes userroles',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	applicationController.loadModel({
		docid: docid,
		model: User,
		population: population,
		searchusername: true,
		callback: function (err, doc) {
			if (err) {
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (doc) {
				req.controllerData.user = doc;
				next();
			}
			else {
				applicationController.handleDocumentQueryErrorResponse({
					err: new Error('invalid user request'),
					res: res,
					req: req
				});
			}
		}
	});
};

var loadUsers = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// population = 'contenttypes collections authors primaryauthor',
		searchRegEx = new RegExp(applicationController.stripTags(req.query.search), 'gi');

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
		model: User,
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
				req.controllerData.users = documents;
				next();
			}
		}
	});
};

var searchResults = function (req, res) {
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
						title: 'User Search Results'
					},
					users: req.controllerData.users,
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
	User = mongoose.model('User');

	return {
		show: show,
		index: index,
		update: update,
		loadUser: loadUser,
		loadUsers: loadUsers,
		searchResults: searchResults
	};
};

module.exports = controller;
