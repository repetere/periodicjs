'use strict';

var path = require('path'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	appController = require(path.join(process.cwd(),'app/controller/application')),
	applicationController,
	appSettings,
	mongoose,
	User,
	logger;

var login = function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			logger.error(err);
			return next(err);
		}
		if (!user) {
			req.flash('error',"invalid credentials, did you forget your password?");
			return res.redirect('/auth/login');
		}
		req.logIn(user, function(err) {
			if (err) {
				logger.error(err);
				return next(err);
			}
			if(req.session.return_url){
				return res.redirect(req.session.return_url);
			}
			else{
				return res.redirect('/');
			}
		});
	})(req, res, next);
};

var logout = function(req, res) {
	req.logout();
	res.redirect('/');
};

var rememberme = function(req, res, next){
	if (req.method === 'POST' && req.url === '/login') {
		if (req.body.rememberme) {
			req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
		}
		else {
			req.session.cookie.expires = false;
		}
	}
	next();
};

var facebook = function(req, res, next) {
	passport.authenticate('facebook', {
		scope: [ 'email','publish_actions','offline_access','user_status' ,'user_likes','user_checkins','user_about_me','read_stream']
	})(req, res, next);
};

var facebookcallback = function(req, res, next) {
	var loginUrl = (req.session.return_url) ? req.session.return_url : '/admin';
	var loginFailureUrl = (req.session.return_url) ? req.session.return_url : '/auth/login?return_url='+req.session.return_url;
	passport.authenticate('facebook', {
		successRedirect: loginUrl,
		failureRedirect: loginFailureUrl,
		failureFlash: 'Invalid username or password.'
	})(req, res, next);

};

var ensureAuthenticated = function(req, res, next) {
	if (req.isAuthenticated()) {
        if (!req.user.username) {
            res.redirect('/user/finishregistration');
        }
        else {
            return next();
        }
    }
    else {
        if (req.query.format === "json"){
            res.send({
                "result": "error",
                "data": {
                    error: "authentication requires "
                }
            });
        }
        else {
            logger.verbose("controller - user.js - " + req.originalUrl);
            if (req.originalUrl) {
                req.session.return_url = req.originalUrl;
                res.redirect('/auth/login?return_url=' + req.originalUrl);
            }
            else {
                res.redirect('/auth/login');
            }
        }
    }
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	User = mongoose.model('User');

	passport.use(new LocalStrategy(function(username, password, done) {
		User.findOne({
			$or: [{
				username:  { $regex : new RegExp(username, "i") }
			}, {
				email:  { $regex : new RegExp(username, "i") }
			}]
		}, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, {
					message: 'Unknown user ' + username
				});
			}
			user.comparePassword(password, function(err, isMatch) {
				if (err) {
					return done(err);
				}

				if (isMatch) {
					return done(null, user);
				}
				else {
					logger.verbose(" in passport callback when no password");
					return done(null, false, {
						message: 'Invalid password'
					});
				}
			});
		});
	}));

	passport.use(new FacebookStrategy({
			clientID: appSettings.oauth.facebook.appid,
			clientSecret: appSettings.oauth.facebook.appsecret,
			callbackURL: appSettings.oauth.facebook.callbackurl
		},
		function(accessToken, refreshToken, profile, done) {
			// console.log("accessToken:" +accessToken);
			// console.log("refreshToken:" +refreshToken);
			// console.log("profile:",profile);
			// var newUser = new User;
			var facebookdata = profile._json;
			User.findOne({
					facebookid: facebookdata.id,
					email: facebookdata.email,
					facebookaccesstoken: accessToken
				},function(err,user){
					if(err){
						return done(err, null);
					}
					else if(user){
						return done(null, user);
					}
					else{
						User.findOne({
								email: facebookdata.email
							},
							function(err, existingUser) {
								if (err) {
									return done(err);
								}
								else if (existingUser) {
									logger.info("model - user.js - already has an account, trying to connect account");
									existingUser.facebookid = facebookdata.id;
									existingUser.facebookaccesstoken = accessToken;
									existingUser.facebookusername = facebookdata.username;

									existingUser.save(done);
								}
								else {
								    logger.info("model - user.js - creating new facebook user");
								    User.create({
								        email: facebookdata.email,
								        facebookid: facebookdata.id,
								        facebookaccesstoken: accessToken,
								        facebookusername: facebookdata.username,
								        activated: true,
								        accounttype: "regular",
								        firstname: facebookdata.first_name,
								        lastname: facebookdata.last_name
								    }, done);
								}
						});
					}
			});
		})
	);

	return{
		rememberme:rememberme,
		login:login,
		logout:logout,
		facebook:facebook,
		facebookcallback:facebookcallback,
        ensureAuthenticated:ensureAuthenticated
	};
};


passport.serializeUser(function(user, done) {
	logger.verbose("controller - auth.js - serialize user");

	done(null, user._id);
	// var createAccessToken = function() {
	// 	var token = user.generateRandomToken();
	// 	User.findOne({
	// 		accessToken: token
	// 	}, function(err, existingUser) {
	// 		if (err) {
	// 			return done(err);
	// 		}
	// 		if (existingUser) {
	// 			createAccessToken(); // Run the function again - the token has to be unique!
	// 		} else {
	// 			user.set('accessToken', token);
	// 			console.log("pre save - user.get('accessToken')",user.get('accessToken'));
	// 			user.save(function(err) {
	// 				if (err) {
	// 					return done(err);
	// 				}
	// 				else{
	// 					console.log("user.get('accessToken')",user.get('accessToken'));
	// 					return done(null, user.get('accessToken'));
	// 				}
	// 			});
	// 		}
	// 	});
	// };

	// if (user._id) {
	// 	createAccessToken();
	// }
});

passport.deserializeUser(function(token, done) {
	logger.verbose("controller - auth.js - deserialize user");
	User.findById(token, function(err, user) {
		done(err, user);
	});
	// User.findOne({
	// 	accessToken: token
	// })
	// .populate("profileimage")
	// .exec(function(err, user) {
	// 	// console.log(user)
	// 	done(err, user);
	// });
});

module.exports = controller;



/*
exports.
exports.
exports.requestCSRF = function(req, res){
	User.validApiKey(req.body.userid,req.body.apikey,function(err,user){
		if (err) {
			logger.error(err);
			res.send({
				"result": "error",
				"data": err
			});
		}
		else{
			res.send({
				"result": "success",
				data:{
					_csrf: req.session._csrf					
				}
			});		
		}
	})
}
exports.mobileLogin = function(req, res, next) {
	var userdata = req.query;
	console.log(userdata)
	logger.verbose("controller - auth.js - mobile login");
	passport.authenticate('local', function(err, user, info) {

		// console.log("in callback returnf rom auth")
		console.log(err)

		if (err) {
			logger.error(err);
			res.send({
				"result": "error",
				"data": err
			});
		}
		else if (!user) {
			logger.verbose("controller - auth.js - no user")
			if(application_controller.is_valid_email(userdata.username)){
					User.fastRegisterUser(userdata,function(err,returnedUser){
					if(err){
						console.log(err.toString())
						res.send({
							"result": "error-auth",
							"data": err.toString()
						});
					}
					else{
						res.send({
							"result": "success-register",
							"data": {
								user: returnedUser,
								_csrf: req.session._csrf
							}
						});
					}
				})
			}
			else{
				res.send({
					"result": "register-error",
					"data": "invalid email"
				});
			}
		}
		else{
			User.findOne({_id:user._id}).populate("profileimage").exec(function(err,loggedInUser){
				if (err) {
					logger.error(err);
					res.send({
						"result": "error",
						"data": err
					});
				}
				else{

					if(loggedInUser.password){
						loggedInUser.password = null;
						delete loggedInUser.password;
					}
					res.send({
						"result": "success",
						"data": {
							user: loggedInUser,
							_csrf: req.session._csrf
						}
					});
				}
			})

		}

	})(req, res, next);
};

exports.
exports.

// Passport session setup.



// Use the LocalStrategy within Passport.



 */