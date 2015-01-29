'use strict';

var mongoose = require('mongoose'),
	merge = require('utils-merge'),
	async = require('async'),
	path = require('path'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	logger = console;

var userSchema = new Schema({
	id: ObjectId,
	email: {
		type: String,
		index: {
			unique: true,
			sparse: false
		}
	},
	firstname: String,
	lastname: String,
	username: {
		type: String,
		index: {
			unique: true,
			sparse: true
		}
	},
	password: String,
	url: String,
	birthday: Date,
	userid: {
		type: Number,
		index: {
			sparse: true
		}
	},
	accesstoken: String,
	description: {
		type: String,
		'default': 'No profile'
	},
	activated: {
		type: Boolean,
		'default': false
	},
	location: {
		city: String,
		country: String,
		state: String,
		zip: String,
		loc: {
			longitude: Number,
			latitude: Number
		}
	},
	createdat: {
		type: Date,
		'default': Date.now
	},
	updatedat: {
		type: Date,
		'default': Date.now
	},
	accounttype: {
		type: String,
		'default': 'basic'
	},
	gender: {
		type: String,
		'default': 'male'
	},
	assets: [{
		type: ObjectId,
		ref: 'Asset'
	}],
	primaryasset: {
		type: ObjectId,
		ref: 'Asset'
	},
	coverimages: [{
		type: ObjectId,
		ref: 'Asset'
	}],
	coverimage: {
		type: ObjectId,
		ref: 'Asset'
	},
	userroles: [{
		type: ObjectId,
		ref: 'Userrole'
	}],
	apikey: String,
	// twitterAccessToken: String,
	// twitterAccessTokenSecret: String,
	// twitterUsername: String,
	// twitterId: String,
	// facebookaccesstoken: String,
	// facebookusername: String,
	// facebookid: String,
	// foursquareAccessToken: String,
	// foursquareId: String,
	// foursquareName: String,
	attributes: Schema.Types.Mixed, //moved facebook/socialdata to attributes
	extensionattributes: Schema.Types.Mixed,
	random: Number
});

userSchema.pre('save', function (next, done) {
	this._wasNew = this.isNew;
	this.random = Math.random();

	// var badusername = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
	if (this.password !== undefined && this.password.length < 8) {
		done(new Error('Password is too short'));
	}
	else if (this.username !== undefined && this.username.length < 4) {
		done(new Error('Username is too short'));
	}
	else if (this.email !== undefined && this.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null) {
		done(new Error('Invalid email'));
	}
	// else if (this.username !== undefined && badusername.test(this.username)) {
	//     done(new Error('Invalid username'));
	// } 
	else {
		next();
	}
});

// userSchema.post('init', function (doc) {
// 	logger.info('model - user.js - ' + doc._id + ' has been initialized from the db');
// });
// userSchema.post('validate', function (doc) {
// 	logger.info('model - user.js - ' + doc._id + ' has been validated (but not saved yet)');
// });
// userSchema.post('save', function (doc) {
// 	logger.info('model - user.js - ' + doc._id + ' has been saved');
// });
// userSchema.pre('remove', function (doc) {
// 	console.log('==================deleted============');
// 	logger.info('model - user.js - ' + doc._id + ' has been removed');
// });

// Password verification
userSchema.methods.comparePassword = function (candidatePassword, cb) {
	var bcrypt = require('bcrypt');
	if (this.password) {
		bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
			if (err) {
				return cb(err);
			}
			cb(null, isMatch);
		});
	}
	else {
		logger.info('user has no pw');
		return cb(null, false);
	}
};


// Remember Me implementation helper method
userSchema.methods.generateRandomToken = function () {
	// var user = this,
	var chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
		token = new Date().getTime() + '_';
	for (var x = 0; x < 16; x++) {
		var i = Math.floor(Math.random() * 62);
		token += chars.charAt(i);
	}
	return token;
};
userSchema.statics.generateRandomTokenStatic = function () {
	// var user = this,
	var chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
		token = new Date().getTime() + '_';
	for (var x = 0; x < 16; x++) {
		var i = Math.floor(Math.random() * 62);
		token += chars.charAt(i);
	}
	return token;
};

userSchema.statics.checkValidation = function (options) {
	var userdata = options.newuser;

	if ((typeof options.checkusername==='undefined' || options.checkusername ===true) && (userdata.username === undefined || userdata.username.length < 4)) {
		return new Error('Username is too short');
	}
	else if ( (typeof options.checkemail==='undefined' || options.checkemail===true ) && (userdata.email === undefined || userdata.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null) ){
		return new Error('Invalid email');
	}
	else if (options.checkpassword && (userdata.password === undefined || userdata.password.length < 8)) {
		return new Error('Password is too short');
	}
	else if (options.checkpassword && (userdata.password !== userdata.passwordconfirm)) {
		return new Error('Passwords do not match');
	}
	else {
		return null;
	}
};

userSchema.statics.validApiKey = function (userid, apikey, callback) {
	var User = mongoose.model('User');
	User.find({
		_id: userid,
		apikey: apikey
	}, function (err, user) {
		if (err) {
			logger.error(err);
			callback(err, false);
		}
		else if (user) {
			callback(false, user);
		}
		else {
			logger.silly('model - user.js - invalid apikey');
			callback(new Error('invalid apikey'), false);
		}
	});
};

userSchema.statics.hasPrivilege = function (user, privilege) {
	// console.log(' hasPrivilege user, privilege',user,privilege);
	return user.accounttype === 'admin' || user.privileges[privilege];
};

userSchema.statics.checkExistingUser = function(options,callback){
	var User = mongoose.model('User'),
		userdata = options.userdata,
		searchUsernameRegEx = (userdata.username)? new RegExp(userdata.username, 'gi') : null,
		searchEmailRegEx = (userdata.email)?  new RegExp(userdata.email, 'gi') : null,
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
		if(err){
			callback(err);
		}
		else if(user){
			callback(new Error('you already have an account'));
		}
		else{
			callback(null,'no existing user');
		}
	});
};

userSchema.statics.fastRegisterUser = function (userdataparam, callback) {
	var bcrypt = require('bcrypt');
	var userdata = userdataparam;
	// console.log(userdata);
	if (userdata._csrf) {
		delete userdata._csrf;
	}
	if (userdata.submit) {
		delete userdata.submit;
	}
	if (
		userdata.password === undefined || !userdata.password || userdata.password === '' || userdata.password === ' ') {
		delete userdata.password;
		delete userdata.passwordconfirm;
		if (callback) {
			callback(new Error('missing password'), userdata);
		}
	}
	else if (userdata.password.length < 6) {
		if (callback) {
			callback(new Error('password is too short - min 6 characters'), userdata);
		}
	}
	else {
		delete userdata.passwordconfirm;
		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(userdata.password, salt, function (err, hash) {
				userdata.password = hash;
				if (userdata.username && !userdata.email) {
					userdata.email = userdata.username;
					delete userdata.username;
				}
				var User = mongoose.model('User');
				userdata.apikey = User.generateRandomTokenStatic();
				console.log(__dirname, userdata);

				var newUser = new User(userdata);
				newUser.save(function (err, user) {
					if (err) {
						logger.error(err);
						if (callback) {
							callback(err, userdata);
						}
					}
					else {
						if (callback) {
							callback(false, user);
						}
					}
				});

			});
		});
	}
};

userSchema.statics.logInNewUser = function(options, callback){
	try{
		var req = options.req;
		req.login(
			options.newuser,
			function(loginerr){
				if(loginerr){
					callback(loginerr,null);
				}
				else{
					callback(null,options.newuser);
				}
		});
	}
	catch(e){
		callback(e,null);
	}
};

userSchema.statics.sendNewUserWelcomeEmail = function(options, callback){
	try{
		options.welcomeemaildata.getEmailTemplateFunction({
				viewname: options.welcomeemaildata.emailviewname,
				themefileext: options.welcomeemaildata.themefileext
			},
			function (err, templatepath) {
				if (err) {
					callback(err);
				}
				else {
					// console.log('user for forgot password', user);
					if (templatepath === options.welcomeemaildata.emailviewname) {
						templatepath = path.resolve(process.cwd(), 'app/views', templatepath + '.' + options.welcomeemaildata.themefileext);
					}
					options.welcomeemaildata.sendEmailFunction({
						appenvironment: options.welcomeemaildata.appenvironment,
						to: options.newuser.email,
						cc: 'yawetse@gmail.com',
						replyTo: options.welcomeemaildata.replyto,
						subject: options.welcomeemaildata.subject || options.welcomeemaildata.appname + ' New User Registration',
						emailtemplatefilepath: templatepath,
						emailtemplatedata: {
							user: options.newuser,
							hostname: options.welcomeemaildata.hostname,
							appname: options.welcomeemaildata.appname
						}
					}, callback);
				}
			}
		);
	}
	catch(e){
		callback(e,null);
	}
};

userSchema.statics.createNewUserAccount = function(options,callback){
	var validationErrors,
		newuseroptions,
		newelycreateduser,
		defaultUserOptions = {
			newuser: {},
			checkusername: false,
			checkpassword: true,
			length_of_username: 4,
			length_of_password: 8
		},
		User = mongoose.model('User');

	newuseroptions = merge(defaultUserOptions, options);
	validationErrors = User.checkValidation(newuseroptions);
	if(validationErrors){
		callback(validationErrors,null);
	}
	else{
		async.series({
			checkExisitingUser:function(asyncCB){
				User.checkExistingUser({
					userdata : newuseroptions.newuser
				},asyncCB);
			},
			fastRegister:function(asyncCB){
				User.fastRegisterUser(newuseroptions.newuser,function(err,newfastregisteruser){
					if(err){
						asyncCB(err);
					}
					else{
						newelycreateduser = newfastregisteruser;
						asyncCB(null,newfastregisteruser);
					}
				});
			},
			loginNewlyCreatedUser:function(asyncCB){
				if(newuseroptions.lognewuserin){
					User.logInNewUser({
						req: newuseroptions.req,
						newuser: newelycreateduser
					},asyncCB);
				}
				else{
					asyncCB(null,'skipping logging in user');
				}
			},
			sendUserWelcomeEmail:function(asyncCB){
				if(newuseroptions.send_new_user_email && newelycreateduser.email){
					User.sendNewUserWelcomeEmail({
						welcomeemaildata: newuseroptions.welcomeemaildata,
						newuser: newelycreateduser
					},asyncCB);
				}
				else{
					asyncCB(null,'skipping new user welcome email');
				}
			}
		},
		function(asyncErr,createduser){
			if(asyncErr){
				callback(asyncErr,null);
			}
			else{
				callback(null,createduser);
			}
		});
	}
};

exports = module.exports = userSchema;
