'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger;

var index = function (req, res) {
	var recentitems = req.controllerData.items || {};
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'home/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'homepage'
					},
					items: recentitems,
					user: req.user
				}
			});
		}
	);
};
var default_view = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'home/default',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'default'
					},
					user: req.user
				}
			});
		}
	);
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
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'home/error404',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Not Found'
					},
					user: req.user,
					url: req.url
				}
			});
		}
	);
};

var catch404 = function (req, res) {
	var err = new Error('Page not found');
  res.status(404);
	// next(err);

	CoreController.handleDocumentQueryErrorResponse({
		err: err,
		req: req,
		res: res,
		errorflash: err.message + ', ' + req.url
	});
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);

	return {
		index: index,
		default_view: default_view,
		get_installoutputlog: get_installoutputlog,
		error404: error404,
		catch404: catch404
	};
};

module.exports = controller;
