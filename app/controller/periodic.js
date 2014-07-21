'use strict';

var path = require('path'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	logger;

var ensureAuthenticated = function(req, res, next) {
	if(req.isAuthenticated()) {
		if(!req.user.username) {
			res.redirect('/user/finishregistration');
		} else {
			return next();
		}
	} else {
		if(req.query.format === "json") {
			res.send({
				"result": "error",
				"data": {
					error: "authentication requires "
				}
			});
		} else {
			logger.verbose("controller - user.js - " + req.originalUrl);
			if(req.originalUrl) {
				req.session.return_url = req.originalUrl;
				res.redirect('/auth/login?return_url=' + req.originalUrl);
			} else {
				res.redirect('/auth/login');
			}
		}
	}
};

var controller = function(resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return {
		ensureAuthenticated: ensureAuthenticated
	};
};

module.exports = controller;
