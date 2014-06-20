'use strict';

var path = require('path'),
	appController = require(path.join(process.cwd(),'app/controller/application')),
    extend = require('util-extend'),
    async = require('async'),
	applicationController,
	appSettings,
	mongoose,
	User,
	logger;

var getAdminMenu = function(options){
    var adminmenu = {};
    for(var x in appSettings.extconf.extensions){
        if(appSettings.extconf.extensions[x].enabled,appSettings.extconf.extensions[x].enabled===true && appSettings.extconf.extensions[x].periodicConfig['periodicjs.ext.admin']){
            adminmenu = extend( adminmenu,appSettings.extconf.extensions[x].periodicConfig['periodicjs.ext.admin'] );
        }
    }
    return adminmenu;
};

var index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/index',
    pluginname:'periodicjs.ext.admin',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'admin',
                    extensions:getAdminMenu()
                },
                periodic:{
                	version: appSettings.version
                },
                user:req.user
            }
        });
    }});
};

var posts_index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/posts/index',
    pluginname:'periodicjs.ext.admin',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'post admin',
                    extensions:getAdminMenu()
                },
                periodic:{
                	version: appSettings.version
                },
                posts: req.controllerData.posts,
                user:req.user
            }
        });
    }});
};

var post_new = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/posts/new',
    pluginname:'periodicjs.ext.admin',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'New Post',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/post.js"],
                    extensions:getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                post:null,
                user:req.user
            }
        });
    }});
};

var post_edit = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/posts/edit',
    pluginname:'periodicjs.ext.admin',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'Edit Post',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/post.js"],
                    extensions:getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                post: req.controllerData.post,
                user:req.user
            }
        });
    }});
};

var loadExtension = function(req, res, next){
    var extname = req.params.id,
        currentExtensions = appSettings.extconf.extensions,
        z=false,
        selectedExt;

    for (var x in currentExtensions){
        if(currentExtensions[x].name===extname){
            z=x;
        }
    }

    if(z!==false){
        selectedExt = currentExtensions[z];
    }
    req.controllerData = (req.controllerData)?req.controllerData:{};
    req.controllerData.extension = selectedExt;
    next();
};

var loadExtensions = function(req, res, next){
    req.controllerData = (req.controllerData)?req.controllerData:{};

    applicationController.loadExtensions({
        periodicsettings:appSettings,
        callback:function (err,extensions) {
            if(err){
                applicationController.handleDocumentQueryErrorResponse({
                    err:err,
                    res:res,
                    req:req
                });
            }
            else{
                req.controllerData.extensions = extensions;
                next();
            }
        }
    })
};

var extensions_index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/extensions/index',
    pluginname:'periodicjs.ext.admin',
    themepath:appSettings.themepath,
    themefileext:appSettings.templatefileextension,
    callback:function(templatepath){
        // console.log("req.controllerData.extensions",req.controllerData.extensions);
        applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:templatepath,
            responseData:{
                pagedata:{
                    title:'post admin',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/ext.js"],
                    extensions:getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                posts: false,
                extensions: req.controllerData.extensions,
                user:req.user
            }
        });
    }});
};

var extension_show = function(req, res, next){
    var extname = req.params.id,
        Extensions = require(path.join(process.cwd(),'app/lib/extensions')),
        fs = require('fs-extra'),
        extPackageConf = Extensions.getExtensionPackageJsonFilePath(extname),
        extPeriodicConf = Extensions.getExtensionPeriodicConfFilePath(extname);


    // an example using an object instead of an array
    async.parallel({
        packagefile: function(callback){
            fs.readJson(extPackageConf, callback);
        },
        periodicfile: function(callback){
            fs.readJson(extPeriodicConf, callback);
        }
    },
    function(err, results) {
        if(err){
            applicationController.handleDocumentQueryErrorResponse({
                err:err,
                res:res,
                req:req
            });
        }
        else{
            applicationController.getPluginViewTemplate({
                res:res,
                req:req,
                viewname:'p-admin/extensions/show',
                pluginname:'periodicjs.ext.admin',
                themepath:appSettings.themepath,
                themefileext:appSettings.templatefileextension,
                callback:function(templatepath){
                    // console.log("req.controllerData.extensions",req.controllerData.extensions);
                    applicationController.handleDocumentQueryRender({
                        res:res,
                        req:req,
                        renderView:templatepath,
                        responseData:{
                            pagedata:{
                                title:'post admin',
                                headerjs: ["/extensions/periodicjs.ext.admin/javascripts/extshow.js"],
                                extensions:getAdminMenu()
                            },
                            periodic:{
                                version: appSettings.version
                            },
                            extdata:results,
                            extension: req.controllerData.extension,
                            user:req.user
                        }
                    });
                }});
        }
    });
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	
	return{
		index:index,
		posts_index:posts_index,
		post_new:post_new,
        post_edit:post_edit,
        extensions_index:extensions_index,
        loadExtensions:loadExtensions,
        loadExtension:loadExtension,
        extension_show:extension_show,
	};
};

module.exports = controller;