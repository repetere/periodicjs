'use strict';

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const merge = require('utils-merge');
const async = require('async');
const path = require('path');
const complexity = require('complexity');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const logger = console;
const PeriodicSchemaClass = require('./periodic_schema.class.js');
let schemaMethods = {};
let schemaStatics = {};
let preSaveFunction = function (next, done) {
	this._wasNew = this.isNew;
	this.random = Math.random();

	if (this.email !== undefined && this.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null) {
		done(new Error('Invalid email'));
	}

	else {
		next();
	}
};
let schemaModelAttributes = {
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
	accounttype: {
		type: String,
		'default': 'basic'
	},
	gender: {
		type: String
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
	tags: [{
		type: ObjectId,
		ref: 'Tag'
	}],
	categories: [{
		type: ObjectId,
		ref: 'Category'
	}],
	apikey: String,
	random: Number
};

class PeriodicSchemaAttributes extends PeriodicSchemaClass.attributes{
	constructor() {
		super({
			entitytype: 'account'
		});
	}
}

// Password verification
schemaMethods.comparePassword = function (candidatePassword, cb) {
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
schemaMethods.generateRandomToken = function () {
	// var user = this,
	var chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
		token = new Date().getTime() + '_';
	for (var x = 0; x < 16; x++) {
		var i = Math.floor(Math.random() * 62);
		token += chars.charAt(i);
	}
	return token;
};

schemaStatics.generateRandomTokenStatic = function () {
	// var user = this,
	var chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
		token = new Date().getTime() + '_';
	for (var x = 0; x < 16; x++) {
		var i = Math.floor(Math.random() * 62);
		token += chars.charAt(i);
	}
	return token;
};

schemaStatics.checkValidation = function (options) {
	var userdata = options.newuser,
	min_username_length = (options && options.length_of_username) ? options.length_of_username : 4,
	min_password_length = (options && options.length_of_password) ? options.length_of_password : 8;
	// console.log('user model userdata',options, options.useComplexity, options.complexity);

	if ((typeof options.checkusername==='undefined' || options.checkusername ===true) && (userdata.username === undefined || userdata.username.length < min_username_length)) {
		return new Error('Username is too short');
	}
	else if ( (typeof options.checkemail==='undefined' || options.checkemail===true ) && (userdata.email === undefined || userdata.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null) ){
		return new Error('Invalid email');
	}
	else if (options.useComplexity && userdata.password && !complexity.check(userdata.password, options.complexity)) {
		return new Error('Password does not meet complexity requirements');
	}
	else if (typeof userdata.password !=='undefined' && options.checkpassword && (userdata.password === undefined || userdata.password.length < min_password_length)) {
		return new Error('Password is too short');
	}
	else if (options.checkpassword && (userdata.password !== userdata.passwordconfirm)) {
		return new Error('Passwords do not match');
	}
	else {
		return null;
	}
};

schemaStatics.validApiKey = function (userid, apikey, callback) {
	var User = mongoose.model('Account');
	User.findOne({
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
			console.log('model - user.js - invalid apikey');
			callback(new Error('invalid apikey'), false);
		}
	});
};

schemaStatics.hasPrivilege = function (user, privilege) {
	// console.log(' hasPrivilege user, privilege',user,privilege);
	return user.accounttype === 'admin' || user.privileges[privilege];
};

schemaStatics.checkExistingUser = function(options,callback){
	var User = mongoose.model('Account'),
		userdata = options.userdata;
	var searchUsernameRegEx = (userdata.username) ? new RegExp(`^${ userdata.username.replace(/([^\w\d\s])/g, '\\$1') }$`, 'i') : null,
		searchEmailRegEx = (userdata.email) ? new RegExp(`^${ userdata.email.replace(/([^\w\d\s])/g, '\\$1') }$`, 'i') : null,
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

schemaStatics.fastRegisterUser = function (userdataparam, callback) {
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
	else if (userdata.password.length <= 1) {
		if (callback) {
			callback(new Error('password is too short'), userdata);
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
				var User = mongoose.model('Account');
				userdata.apikey = User.generateRandomTokenStatic();
				// console.log(__dirname, userdata);

				var newUser = new User(userdata);
				newUser.save(function (err, user) {
					// console.log('newUser.save err, user',err, user);
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

schemaStatics.logInNewUser = function(options, callback){
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

schemaStatics.sendNewUserWelcomeEmail = function(options, callback){
	try{
		if(options.requireactivation){
			options.welcomeemaildata.emailviewname = 'email/user/welcome_with_validation';
		}
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
						cc: options.welcomeemaildata.replyto,
						replyTo: options.welcomeemaildata.replyto,
						from: options.welcomeemaildata.replyto,
						subject: options.welcomeemaildata.subject || options.welcomeemaildata.appname + ' New User Registration',
						emailtemplatefilepath: templatepath,
						emailtemplatedata: {
							user: options.newuser,
							hostname: options.welcomeemaildata.hostname,
							appname: options.welcomeemaildata.appname,
							filename: templatepath
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

schemaStatics.createNewUserAccount = function(options,callback){
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
		User = mongoose.model('Account');

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
						requireactivation: newuseroptions.requireuseractivation,
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

class userModel extends PeriodicSchemaClass.model{
	constructor(resources) {
		resources = Object.assign({}, resources);
		resources.schemaStatics = schemaStatics;
		resources.schemaMethods = schemaMethods;
		resources.schemaModelAttributes = schemaModelAttributes;
		resources.periodicSchemaAttributes = new PeriodicSchemaAttributes();
		super(resources);
		this.schema.pre('save', preSaveFunction);
	}
}

module.exports = userModel;
