'use strict';

var path = require('path'),
	appSettings,
	mongoose,
	User,
	logger;

var createNewUser = function(options){
	var userdata = options.userdata,
		applicationController = options.applicationController,
		req = options.req,
		res = options.res,
		userError;
  if ( userdata.password === undefined || !userdata.password || userdata.password === '' || userdata.password === ' ' || userdata.passwordconfirm === undefined || !userdata.passwordconfirm || userdata.passwordconfirm === '' || userdata.passwordconfirm === ' ') {
    delete userdata.password;
    delete userdata.passwordconfirm;

    userError = new Error("missing password");
    applicationController.handleDocumentQueryErrorResponse({
			err:userError,
			res:res,
			req:req,
			errorflash:userError.message,
			redirecturl:"/user/new"
		});
  }
  else if (userdata.passwordconfirm !== userdata.password) {
      delete userdata.password;
      delete userdata.passwordconfirm;

      userError = new Error("confirmation password doesn't match");
      applicationController.handleDocumentQueryErrorResponse({
				err:userError,
				res:res,
				req:req,
				errorflash:userError.message,
				redirecturl:"/user/new"
			});
  }
  else if (userdata.email === undefined || !userdata.email || userdata.username === undefined || !userdata.username) {
		userError = new Error("missing required data");
		applicationController.handleDocumentQueryErrorResponse({
			err:userError,
			res:res,
			req:req,
			errorflash:userError.message,
			redirecturl:"/user/new"
		});
  }
  else {
		var searchUsernameRegEx = new RegExp(userdata.username, "gi"),
			searchEmailRegEx = new RegExp(userdata.email, "gi"),
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

		User.findOne(query,function(err,user){
			if (err) {
				userError = err;
        applicationController.handleDocumentQueryErrorResponse({
					err:userError,
					res:res,
					req:req,
					errorflash:userError.message,
					redirecturl:"/user/new"
				});
			}
			else if (user) {
				userError = new Error("you already have an account");
				applicationController.handleDocumentQueryErrorResponse({
					err:userError,
					res:res,
					req:req,
					errorflash:userError.message,
					redirecturl:"/user/new"
				});
			}
			else{
				delete userdata.passwordconfirm;
				User.fastRegisterUser(userdata, function(err, returnedUser) {
					if (err) {
						userError = err;
						applicationController.handleDocumentQueryErrorResponse({
							err:userError,
							res:res,
							req:req,
							errorflash:userError.message,
							redirecturl:"/user/new"
						});
					}
					else {
						req.logIn(returnedUser, function(err) {
							logger.verbose("controller - auth.js - got user");

							if (err) {
								userError = err;
								applicationController.handleDocumentQueryErrorResponse({
									err:userError,
									res:res,
									req:req,
									errorflash:userError.message,
									redirecturl:"/auth/login"
								});
							}
							else{
								logger.silly("controller - auth.js - " + req.session.return_url);
								if (req.session.return_url) {
									return res.redirect(req.session.return_url);
								}
								else {
									return res.redirect('/');
								}
							}
						});
						if(options.callback){
							options.callback(userdata);
						}
					}
				});
			}
		});
	}
};

var userHelper = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	User = mongoose.model('User');

	return{
		createNewUser:createNewUser
	};
};

module.exports = userHelper;