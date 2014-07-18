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
            sparse: false,
        }
    },
    firstname: String,
    lastname: String,
    username: {
        type: String,
        index: {
            unique: true,
            sparse: true,
        }
    },
    password: String,
    url: String,
    birthday: Date,
	userid: {
        type: Number,
        index: {
            sparse: true,
        }
    },
    accesstoken: String,
    description: {
        type: String,
        "default": "No profile"
    },
    activated: {
        type: Boolean,
        "default": false
    },
    usertype: {
        type: String,
        "default": "regular"
    },
    location: {
        city: String,
        country: String,
        state: String,
        zip: String,
        loc: {
            longitude: Number,
            latitude: Number
        },
    },
    roles:Schema.Types.Mixed,
    privileges:Schema.Types.Mixed,
    createdat: {
        type: Date,
        "default": Date.now
    },
    updatedat: {
        type: Date,
        "default": Date.now
    },
    acounttype: {
        type: String,
        "default": "basic"
    },
    gender: {
        type: String,
        "default": "male"
    },
    userassets: [{
        type: ObjectId,
        ref: "Asset"
    }],
    userasset:{
        type:ObjectId,
        ref:"Asset"
    },
    coverimages: [{
        type: ObjectId,
        ref: "Asset"
    }],
    coverimage:{
        type:ObjectId,
        ref:"Asset"
    },
    userroles: [{
        type: ObjectId,
        ref: "Userrole"
    }],
    apikey: String,
    twitterAccessToken: String,
    twitterAccessTokenSecret: String,
    twitterUsername: String,
    twitterId: String,
    facebookaccesstoken: String,
    facebookusername: String,
    facebookid: String,
    foursquareAccessToken: String,
    foursquareId: String,
    foursquareName: String,
    attributes: Schema.Types.Mixed,
    extensionattributes: Schema.Types.Mixed,
    random: Number
});

userSchema.pre('save', function(next, done) {
    this._wasNew = this.isNew;
    this.random = Math.random();

    var badusername = new RegExp(/\badmin\b|\bconfig\b|\bprofile\b|\bindex\b|\bcreate\b|\bdelete\b|\bdestroy\b|\bedit\b|\btrue\b|\bfalse\b|\bupdate\b|\blogin\b|\blogut\b|\bdestroy\b|\bwelcome\b|\bdashboard\b/i);
    if (this.password !== undefined && this.password.length < 8) {
        done(new Error('Password is too short'));
    } else if (this.username !== undefined && this.username.length < 4) {
        done(new Error('Username is too short'));
    } else if (this.email===undefined || this.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null) {
        done(new Error('Invalid email'));
    }
    // else if (this.username !== undefined && badusername.test(this.username)) {
    //     done(new Error('Invalid username'));
    // } 
    else {
        next();
    }
});

userSchema.post('init', function(doc) {
    logger.info("model - user.js - " + doc._id + ' has been initialized from the db');
});
userSchema.post('validate', function(doc) {
    logger.info("model - user.js - " + doc._id + ' has been validated (but not saved yet)');
});
userSchema.post('save', function(doc) {
    logger.info("model - user.js - " + doc._id + ' has been saved');
});
userSchema.pre('remove', function(doc) {
    console.log('==================deleted============');
    logger.info("model - user.js - " + doc._id + ' has been removed');
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    var bcrypt = require('bcrypt');
    if (this.password) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) {return cb(err);}
            cb(null, isMatch);
        });
    } else {
        logger.info("user has no pw");
        return cb(null, false);
    }
};


// Remember Me implementation helper method
userSchema.methods.generateRandomToken = function() {
    var user = this,
        chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        token = new Date().getTime() + '_';
    for (var x = 0; x < 16; x++) {
        var i = Math.floor(Math.random() * 62);
        token += chars.charAt(i);
    }
    return token;
};
userSchema.statics.generateRandomTokenStatic = function() {
    var user = this,
        chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        token = new Date().getTime() + '_';
    for (var x = 0; x < 16; x++) {
        var i = Math.floor(Math.random() * 62);
        token += chars.charAt(i);
    }
    return token;
};

userSchema.statics.validApiKey = function(userid, apikey, callback) {
    var User = mongoose.model('User');
    User.find({
        _id: userid,
        apikey: apikey
    }, function(err, user) {
        if (err) {
            logger.error(err);
            callback(err, false);
        } else if (user) {
            callback(false, user);
        } else {
            logger.silly("model - user.js - invalid apikey");
            callback(new Error("invalid apikey"), false);
        }
    });
};

userSchema.statics.hasPrivilege = function(user,privilege){
    var hasPrivilege = false;
    if(user.extensionattributes && user.extensionattributes.user_access_control && user.extensionattributes.user_access_control.privileges[privilege]){
        hasPrivilege = true;
    }
    return hasPrivilege;
};

userSchema.statics.fastRegisterUser = function(userdataparam, callback) {
    var bcrypt = require('bcrypt');
    var application_controller = require('../controller/application');
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
            callback(new Error("missing password"), userdata);
        }
    } else if (userdata.password.length < 6) {
        if (callback) {
            callback(new Error("password is too short - min 6 characters"), userdata);
        }
    } else {
        delete userdata.passwordconfirm;
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(userdata.password, salt, function(err, hash) {
                userdata.password = hash;
                if (userdata.username && !userdata.email) {
                    userdata.email = userdata.username;
                    delete userdata.username;
                }
                var User = mongoose.model('User');
                userdata.apikey = User.generateRandomTokenStatic();
                console.log(__dirname,userdata);

                var newUser = new User(userdata);
                newUser.save(function(err, user) {
                    if (err) {
                        logger.error(err);
                        if (callback) {
                            callback(err, userdata);
                        }
                    } else {
                        if (callback) {
                            callback(false, user);
                        }
                    }
                });

            });
        });
    }
};

var sendEmail = function(options, callback) {
    console.log("*********** FINISH ******* sending mail");
    console.log("TODO: sending mail");
    console.log("options",options);
    // console.log("options.emailTemplateFilename",options.emailTemplateFilename)

/*
    var appconfig = require('../config/environment'),
        nodemailer = require("nodemailer"),
        smtpTransport = appconfig.environment.email.messenger.transport,
        emailAddresses = appconfig.environment.email.addresses,
        ejs = require("ejs"),
        fs = require('fs'),
        str = fs.readFile(
            options.emailTemplateFilename,
            'utf8',
            function(err, ejsTemplateData) {
                // console.log("err",err,"ejsTemplateData",ejsTemplateData)

                if (err) {
                    callback(err);
                } else {
                    var emailHtml = ejs.render(ejsTemplateData, options.emailHtml),
                        emailSubject = (appconfig.environment.name !== "production") ? options.emailSubject + " [" + appconfig.environment.name + "]" : options.emailSubject,
                        mailOptions = options.mailOptions;
                    mailOptions.subject = emailSubject;
                    mailOptions.html = emailHtml;
                    mailOptions.from = emailAddresses.general.name + " <" + emailAddresses.general.email + ">";
                    // console.log(emailAddresses.general.name + " <" + emailAddresses.general.email + ">")
                    // console.log("about to send mail")

                    smtpTransport.sendMail(mailOptions, function(err, response) {
                        // console.log("err",err,"response",response)
                        if (err) {
                            logger.error("model - user.js - couldn't send email");
                            logger.error(err);
                            if (callback) {
                                callback(err, null);
                            }
                        } else {
                            logger.verbose("Message sent: " + response.message);
                            if (callback) {
                                callback(null, response);
                            }
                        }
                    });
                }

            });
*/
};
userSchema.statics.sendAsyncWelcomeEmail = function(options, callback) {
    var emailOptions = {};
    emailOptions.user = options;
    // console.log("emailOptions.user",emailOptions.user,"options",options)

    emailOptions.emailSubject = "welcome to Repetere";
    emailOptions.emailTemplateFilename = './views/email/welcome.ejs';
    emailOptions.emailHtml = {
        user: emailOptions.user,
        follower: emailOptions.follower,
        email: {
            subject: emailOptions.emailSubject,
            customCss: ""
        },
        filename: emailOptions.emailTemplateFilename
    };
    emailOptions.mailOptions = {
        to: emailOptions.user.email, // list of receivers
        bcc: "yaw.etse@gmail.com",
        subject: emailOptions.emailSubject,
        generateTextFromHTML: true, // plaintext body
    };
    sendEmail(emailOptions, callback);
};

exports = module.exports = userSchema;