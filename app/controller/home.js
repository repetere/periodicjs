'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger;

var index = function (req, res) {
	var recentitems = req.controllerData.items || {};
	var viewtemplate = {
		viewname: 'home/index',
		themefileext: appSettings.templatefileextension
	},
	viewdata = {
		pagedata: {
			title: 'homepage'
		},
		items: recentitems,
		user: req.user
	};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var default_view = function (req, res) {
	var viewtemplate = {
		viewname: 'home/default',
		themefileext: appSettings.templatefileextension
	},
	viewdata = {
		pagedata: {
			title: 'default'
		},
		user: req.user
	};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var get_installoutputlog = function (req, res) {
	var logfile = path.resolve(process.cwd(), 'logs/install-periodicjs.log'),
		stat = fs.statSync(logfile),
		readStream = fs.createReadStream(logfile);

	res.writeHead(200, {
		'Content-Type': ' text/plain',
		'Content-Length': stat.size
	});
	readStream.pipe(res);
};

var error404 = function (req, res) {
	res.status(404);
	var viewtemplate = {
		viewname: 'home/error404',
		themefileext: appSettings.templatefileextension
	},
	viewdata = {
		pagedata: {
			title: 'Not Found'
		},
		user: req.user,
		url: req.url
	};
	CoreController.renderView(req, res, viewtemplate, viewdata);
};

var catch404 = function (req, res) {
	var err = new Error('Page not found');
  res.status(404);
	// next(err);

	CoreController.handleDocumentQueryErrorResponse({
		err: err,
		req: req,
		res: res,
		use_warning: true,
		errorflash: err.message + ', ' + req.url
	});
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;

	return {
		index: index,
		default_view: default_view,
		get_installoutputlog: get_installoutputlog,
		error404: error404,
		catch404: catch404
	};
};

module.exports = controller;
