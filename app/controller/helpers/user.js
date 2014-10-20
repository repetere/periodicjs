'use strict';

var path = require('path'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreMailer = require('periodicjs.core.mailer'),
	welcomeemailtemplate,
	emailtransport,
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	User,
	logger;

var createNewUser = function (options) {
	var userdata = options.userdata,
		req = options.req,
		res = options.res,
		redirecturl = (options.redirecturl) ? options.redirecturl : '/user/new',
		redirectloginurl = (options.redirectloginurl) ? options.redirectloginurl : '/auth/login',
		userError;
	if (userdata.password === undefined || !userdata.password || userdata.password === '' || userdata.password === ' ' || userdata.passwordconfirm === undefined || !userdata.passwordconfirm || userdata.passwordconfirm === '' || userdata.passwordconfirm === ' ') {
		delete userdata.password;
		delete userdata.passwordconfirm;

		userError = new Error('missing password');
		CoreController.handleDocumentQueryErrorResponse({
			err: userError,
			res: res,
			req: req,
			errorflash: userError.message,
			redirecturl: redirecturl
		});
	}
	else if (userdata.passwordconfirm !== userdata.password) {
		delete userdata.password;
		delete userdata.passwordconfirm;

		userError = new Error('confirmation password doesn\'t match');
		CoreController.handleDocumentQueryErrorResponse({
			err: userError,
			res: res,
			req: req,
			errorflash: userError.message,
			redirecturl: redirecturl
		});
	}
	else if (userdata.email === undefined || !userdata.email || userdata.username === undefined || !userdata.username) {
		userError = new Error('missing required data');
		CoreController.handleDocumentQueryErrorResponse({
			err: userError,
			res: res,
			req: req,
			errorflash: userError.message,
			redirecturl: redirecturl
		});
	}
	else {
		var searchUsernameRegEx = new RegExp(userdata.username, 'gi'),
			searchEmailRegEx = new RegExp(userdata.email, 'gi'),
			query = {};

		if (userdata.username && userdata.email) {
			query = {
				$or: [{
					username: searchUsernameRegEx
				}, {
					email: searchEmailRegEx
				}]
			};
		}
		else if (userdata.username) {
			query = {
				username: searchUsernameRegEx
			};
		}
		else {
			query = {
				email: searchEmailRegEx
			};
		}

		User.findOne(query, function (err, user) {
			if (err) {
				userError = err;
				CoreController.handleDocumentQueryErrorResponse({
					err: userError,
					res: res,
					req: req,
					errorflash: userError.message,
					redirecturl: redirecturl
				});
			}
			else if (user) {
				userError = new Error('you already have an account');
				CoreController.handleDocumentQueryErrorResponse({
					err: userError,
					res: res,
					req: req,
					errorflash: userError.message,
					redirecturl: redirecturl
				});
			}
			else {
				delete userdata.passwordconfirm;
				User.fastRegisterUser(userdata, function (err, returnedUser) {
					if (err) {
						userError = err;
						CoreController.handleDocumentQueryErrorResponse({
							err: userError,
							res: res,
							req: req,
							errorflash: userError.message,
							redirecturl: redirecturl
						});
					}
					else {
						if (options.skiplogin) {
							return res.redirect('/p-admin/users/');
						}
						else {
							req.logIn(returnedUser, function (err) {
								logger.verbose('controller - auth.js - got user');

								if (err) {
									userError = err;
									CoreController.handleDocumentQueryErrorResponse({
										err: userError,
										res: res,
										req: req,
										errorflash: userError.message,
										redirecturl: redirectloginurl
									});
								}
								else {
									logger.silly('controller - auth.js - ' + req.session.return_url);
									if (req.session.return_url) {
										return res.redirect(req.session.return_url);
									}
									else {
										return res.redirect('/');
									}
								}
							});
						}

						if (options.callback) {
							options.callback(userdata);
						}
						if (welcomeemailtemplate && emailtransport) {
							User.sendWelcomeUserEmail({
								subject: appSettings.name + ' New User Registration',
								user: userdata,
								hostname: req.headers.host,
								appname: appSettings.name,
								emailtemplate: welcomeemailtemplate,
								// bcc:'yje2@cornell.edu',
								mailtransport: emailtransport
							}, function (err, status) {
								if (err) {
									console.log(err);
								}
								else {
									console.info('email status', status);
								}
							});
						}
					}
				});
			}
		});
	}
};

var userHelper = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	User = mongoose.model('User');
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'email/user/welcome',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			if (templatepath === 'email/user/welcome') {
				templatepath = path.resolve(process.cwd(), 'app/views', templatepath + '.' + appSettings.templatefileextension);
			}
			User.getWelcomeEmailTemplate({
				templatefile: templatepath
			}, function (err, emailtemplate) {
				if (err) {
					console.error(err);
				}
				else {
					welcomeemailtemplate = emailtemplate;
				}
			});
		}
	);
	CoreMailer.getTransport({
		appenvironment: appSettings.application.environment
	}, function (err, transport) {
		if (err) {
			console.error(err);
		}
		else {
			emailtransport = transport;
		}
	});

	return {
		createNewUser: createNewUser
	};
};

module.exports = userHelper;
