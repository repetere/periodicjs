'use strict';

var mongoose = require('mongoose'),
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
	else if (this.email === undefined || this.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null) {
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

	if (userdata.username === undefined || userdata.username.length < 4) {
		return new Error('Username is too short');
	}
	else if (userdata.email === undefined || userdata.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null) {
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

var sendUserEmail = function (options, callback) {
	var mailtransport = options.mailtransport,
		user = options.user,
		mailoptions = {};

	mailoptions.to = (options.to) ? options.to : user.email;
	mailoptions.cc = options.cc;
	mailoptions.bcc = options.bcc;
	mailoptions.replyTo = options.replyTo;
	mailoptions.subject = options.subject;
	if (options.generatetextemail) {
		mailoptions.generateTextFromHTML = true;
	}
	mailoptions.html = options.html;
	mailoptions.text = options.text;

	mailtransport.sendMail(mailoptions, callback);

	/*
to - Comma separated list or an array of recipients e-mail addresses that will appear on the To: field
cc - Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field
bcc - Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field
replyTo - An e-mail address that will appear on the Reply-To: field
inReplyTo - The message-id this message is replying
references - Message-id list (an array or space separated string)
subject - The subject of the e-mail
text - The plaintext version of the message as an Unicode string, Buffer, Stream or an object {path: '...'}
html - The HTML version of the message as an Unicode string, Buffer, Stream or an object {path: '...'}
headers - An object of additional header fields {"X-Key-Name": "key value"}
attachments - An array of attachment objects (see below for details)
alternatives - An array of alternative text contents (in addition to text and html parts) (see below for details)
envelope - optional SMTP envelope, if auto generated envelope is not suitable (see below for details)
messageId - optional Message-Id value, random value will be generated if not set
date - optional Date value, current UTC string will be used if not set
encoding - optional transfer encoding for the textual parts (defaults to 'quoted-printable')
	*/
};

userSchema.statics.sendWelcomeUserEmail = function (options, callback) {
	var ejs = require('ejs'),
		welcomeemailoptions = options;
	welcomeemailoptions.subject = (options.subject) ? options.subject : 'New User Registration';
	welcomeemailoptions.generatetextemail = true;
	welcomeemailoptions.html = ejs.render(options.emailtemplate, welcomeemailoptions);
	// console.log('welcomeemailoptions', welcomeemailoptions);
	sendUserEmail(welcomeemailoptions, callback);
};

userSchema.statics.UserEmail = function (options, callback) {
	sendUserEmail(options, callback);
};


userSchema.statics.getWelcomeEmailTemplate = function (options, callback) {
	var fs = require('fs-extra'),
		templatefile = options.templatefile;
	fs.readFile(templatefile, 'utf8', callback);
};



exports = module.exports = userSchema;
