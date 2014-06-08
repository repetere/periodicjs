'use strict';

var path = require('path'),
    bcrypt = require('bcrypt'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
    appController = require(path.join(process.cwd(),'app/controller/application')),
    userHelper,
	applicationController,
	appSettings,
	mongoose,
	User,
	logger;

var login = function(req,res,next) {
    applicationController.getPluginViewTemplate({
        res:res,
        req:req,
        viewname:'user/login',
        pluginname:'periodicjs.ext.login',
        themepath:appSettings.themepath,
        themefileext:appSettings.templatefileextension,
        callback:function(templatepath){
            applicationController.handleDocumentQueryRender({
                res:res,
                req:req,
                renderView:templatepath,
                responseData:{
                    pagedata:{
                        title:'Login'
                    },
                    user:req.user
                }
            });
        }
    });
};

var newuser = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'user/new',
    pluginname:'periodicjs.ext.login',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'Register'
                },
                user:req.user
            }
        });
    }});
};

var create = function(req, res ,next) {
    var userdata = applicationController.removeEmptyObjectValues(req.body);
    userHelper.createNewUser({
        userdata:userdata,
        User:User,
        res:res,
        req:req,
        applicationController:applicationController
    });
};

var finishregistration = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'user/finishregistration',
    pluginname:'periodicjs.ext.login',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'complete registration'
                },
                user:req.user
            }
        });
    }});
};

var updateuserregistration = function(req, res, next) {
    var userError;

    User.findOne({
            email: req.user.email
        },
        function(err, userToUpdate) {
            if (err) {
                userError = err;
                applicationController.handleDocumentQueryErrorResponse({
                    err:userError,
                    res:res,
                    req:req,
                    errorflash:userError.message,
                    redirecturl:"/user/finishregistration"
                });
            }
            else if (!userToUpdate) {
                userError = new Error("could not find user, couldn't complate registration");
                applicationController.handleDocumentQueryErrorResponse({
                    err:userError,
                    res:res,
                    req:req,
                    errorflash:userError.message,
                    redirecturl:"/user/finishregistration"
                });
            }
            else {
                userToUpdate.username = req.body.username;
                userToUpdate.save(function(err, userSaved) {
                    if (err) {
                        userError =err;
                        applicationController.handleDocumentQueryErrorResponse({
                            err:userError,
                            res:res,
                            req:req,
                            errorflash:userError.message,
                            redirecturl:"/user/finishregistration"
                        });
                    }
                    else {
                        var forwardUrl = (req.session.return_url) ? req.session.return_url : '/';
                        req.flash('info', "updated user account");
                        res.redirect(forwardUrl);

                        User.sendAsyncWelcomeEmail(userSaved, function() {});
                    }
                });
            }
    });
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
    userHelper = require(path.join(process.cwd(),'app/controller/helpers/user'))(resources);
	User = mongoose.model('User');

    return{
        login:login,
        newuser:newuser,
		create:create,
        finishregistration:finishregistration,
        updateuserregistration:updateuserregistration
	};
};

module.exports = controller;

/*

exports.index = function(req, res, next) {
    if (req.user.accountType != "admin") {
        res.redirect('/home')
    } else {
        if (req.query.filter) {
            var searchRegEx = new RegExp(req.query.filter, "gi");
            var query = {
                $or: [{
                    username: searchRegEx,
                }, {
                    email: searchRegEx,
                }, {
                    firstname: searchRegEx,
                }, {
                    lastname: searchRegEx,
                }]
            };
        } else {
            var query = {};
        }
        var offset = (req.query.o) ? req.query.o : 0,
            limit = (req.query.l) ? req.query.l : 20;
        application_controller.searchModel(req, res, next, logger, User, query, '-username', offset, limit,
            function(documents) {
                res.send({
                    "result": "success",
                    "data": {
                        users: documents
                    }
                });
            }, function(documents) {
                this.flash_messages = req.flash();
                res.render('users/index', {
                    title: 'User page',
                    page: {
                        name: "user_admin"
                    },
                    users: documents
                });
            }, null, 'profileimage ');
    }
    // res.send("respond with a resource");
};

exports.update = function(req, res, next) {
    var user = this.showuser;
    logger.silly("req.body", req.body)
    application_controller.updateModel(User, req, res, next, user, 'user', logger);
};

exports.editUser = function(req, res, next) {
    this.title = "update your profile";
    this.user = req.user;
    this.flash_messages = req.flash();
    logger.silly("controller - user.js - editing profile");
    res.render("users/edit", {
        page: {
            name: "edit_profile"
        }
    })
}
exports.edit = function(req, res) {
    var userToUpdate = req.user;
    this.title = "update your profile";
    this.user = req.user;
    this.flash_messages = req.flash();
    logger.silly("controller - user.js - editing profile");

    var userdata = application_controller.remove_empty_object_values(req.body);
    if (Object.keys(userdata.profile).length == 0) {
        delete userdata.profile;
    }
    logger.verbose(JSON.stringify(userdata))
    User.findOneAndUpdate({
        _id: userToUpdate._id
    }, userdata, {
        multi: false
    }, function(err, doc) {
        // logger.verbose(JSON.stringify(userToUpdate));
        // logger.verbose('user.update just watch')
        // logger.verbose(JSON.stringify(doc));
        if (err) {
            logger.error(err);
            logger.error("controller - user.js - could not update user");
            req.flash('error', err.toString());
            req.render("users/edit", {
                page: {
                    name: "edit_profile"
                }
            })
        } else {
            req.flash('info', "user account updated username only");
            res.render("users/edit", {
                showuser: doc,
                page: {
                    name: "edit_profile"
                }
            })

        }

    });
}
exports.show = function(req, res, next) {
    returnData = this.data;
    // console.log(returnData)
    returnData.forEach(function(rdata) {
        // console.log(rdata)
        if (rdata && rdata.resulttype == "userdata") {
            this.showuser = rdata.result;
        }
        if (rdata && rdata.resulttype == "followingdata") {
            this.showuserfollowing = rdata.result;
            this.showuserfollowing.forEach(function(following) {
                // console.log("this.showuser._id",this.showuser._id,"following.followinguserid",following.followinguserid)
                if (this.showuser._id.toString() == following.followinguserid.toString()) {
                    this.isFollowing = true;
                }
            })
        } else {
            this.isFollowing = false;
        }
    })

    logger.verbose("controller - user.js - showing user")
    var jsondata = {
        "result": "success",
        "data": {
            user: this.showuser
        }
    },
        pagedata = {
            page: {
                name: "userprofile"
            },
            title: this.showuser.username + "'s profile",
            flash_messages: req.flash()
        };
    application_controller.showModel(req, res, next, logger, this.showuser.username + "'s profile", "user", this.showuser, pagedata, jsondata, 'users/show');
};
exports.delete = function(req, res, next) {
    var currentUser = this.showuser;
    // var exercise = this.exercise;
    application_controller.require_admin_user_access(req, res, next, req.user._id, req.user.accountType, currentUser._id, function() {
        application_controller.deleteModel(User, req, res, next, currentUser, 'user', logger);

        Progress.removeProgress({
            userid: req.user._id,
            model: "user",
            dataid: currentUser._id
        }, function(err, data) {
            if (err) {
                logger.error(err)
            } else {
                logger.verbose("deleted progress activity")
                // logger.verbose(data)
            }
        });
    });
};
exports.
exports.

exports.updateFastRegistration = function(req, res, next) {
    var userToUpdate = application_controller.remove_empty_object_values(req.body);
    var userid = userToUpdate._id;
    var userapikey = userToUpdate.apikey;
    if (userToUpdate.username) {
        userToUpdate.username = application_controller.make_user_name_nice(userToUpdate.username);
    }

    if (userToUpdate.profile && Object.keys(userToUpdate.profile).length == 0) {
        delete userToUpdate.profile;
    }
    delete userToUpdate._csrf;
    if (userToUpdate._id) {
        delete userToUpdate._id;
    }
    if (userToUpdate.apikey) {
        delete userToUpdate.apikey;
    }

    User.findOneAndUpdate({
        "_id": userid,
        "apikey": userapikey
    }, userToUpdate, function(err, user) {
        // console.log(user)
        if (err) {
            logger.error(err);
            res.send({
                "result": "error",
                "data": err
            });
        } else if (user) {
            if (req.query.newuser) {
                User.sendAsyncWelcomeEmail(user, function() {});
                var Progress = mongoose.model('Progress');
                var logProgress = {
                    userid: user._id,
                    username: user.username,
                    title: user.username,
                    name: user.username,
                    type: "new user", //exercise, workout
                    model: "user", //exercise, workout
                    dataid: user,
                    data: {
                        description: user.description
                    }
                }
                if (user.profileimages) {
                    logProgress.data.media = user.profileimages;
                }
                Progress.addProgress(logProgress, function(err) {
                    if (err) {
                        logger.error(err)
                    } else {
                        logger.verbose("new account created")
                    }
                });
            }

            var returnToUser = user;
            if (returnToUser.password) {
                returnToUser.password = null;
                delete returnToUser.password;
            }
            res.send({
                "result": "success",
                "data": {
                    user: returnToUser
                }
            });
        } else {
            res.send({
                "result": "error",
                "data": "invalid user request"
            });
        }
    })
}

exports.search = function(req, res) {
    // var pattern = //i
    var searchRegEx = new RegExp("^" + application_controller.strip_tags(req.params.searchQuery), "i");

    logger.verbose("controller - exercise.js - searching for an exercise");
    logger.verbose(searchRegEx);
    User.find({
        $or: [{
            title: searchRegEx
        }, {
            description: searchRegEx
        }]
    }, function(err, users) {
        if (err) {
            // logger.info("controller - exercise.js - no exercises")
            logger.error(err);
            req.flash('error', err.toString());
            res.send({
                "result": "error",
                "data": {
                    error: err
                }
            });
        } else {
            logger.silly("controller - exercise.js - got exercises")
            res.send({
                "result": "success",
                "data": {
                    users: users
                }
            });
        }
    });
};


exports.loadUser = function(req, res, next) {
    var params = req.params;
    var userid = (!params.userid) ? req.user._id.toString() : params.userid;
    application_controller.loadModelWithPopulation(req, res, next, logger, 'user', User, userid, 'coverimage profileimage',
        function(err, doc) {
            if (err) {
                application_controller.loadModelCallbackHelperError('user', req, res, logger);
            } else if (doc) {
                this.showuser = doc;
                next();
            } else {
                application_controller.loadModelCallbackHelperInvalid('user', req, res, logger);
            }
        }.bind(this));
}
exports.
exports.apiAuthenticated = function(req, res, next) {
    // console.log(req.body)
    if (req.body.apikey && req.body.userid) {
        return next();
    } else {
        return next(new Error("invalid api request"));
    }
}
 */