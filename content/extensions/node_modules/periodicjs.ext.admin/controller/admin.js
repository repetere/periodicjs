'use strict';

var path = require('path'),
	appController = require(path.join(process.cwd(),'app/controller/application')),
	applicationController,
	appSettings,
	mongoose,
	User,
	logger;

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
                    title:'admin'
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
                    title:'post admin'
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
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/post.js"]
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
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/post.js"]
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
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/ext.js"]
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
	};
};

module.exports = controller;