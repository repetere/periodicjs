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
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'user/login',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.login'
        },
        function(err,templatepath){
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
    );
};

var newuser = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'user/new',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.login'
        },
        function(err,templatepath){
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
        }
    );
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
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'user/finishregistration',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.login'
        },
        function(err,templatepath){
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
        }
    );
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