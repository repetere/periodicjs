'use strict';

var path = require('path'),
	appController = require(path.join(process.cwd(),'app/controller/application')),
    extend = require('util-extend'),
    async = require('async'),
    fs = require('fs-extra'),
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
                    title:'admin',
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                	version: appSettings.version
                },
                user:req.user
            }
        });
    }});
};

var mail_index = function(req,res,next){
  applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/mailer/index',
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
                    title:'Mail Settings',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/mailer.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                user:req.user
            }
        });
    }
  });
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
                    extensions:applicationController.getAdminMenu()
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
                    extensions:applicationController.getAdminMenu()
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
                    title:req.controllerData.post.title+' - Edit Post',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/post.js"],
                    extensions:applicationController.getAdminMenu()
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

var collections_index = function(req, res, next) {
    console.log("req.controllerData.collections",req.controllerData.collections);

    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/collections/index',
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
                    title:'Collections',
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                collections: req.controllerData.collections,
                user:req.user
            }
        });
    }});
};

var collection_new = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/collections/new',
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
                    title:'New Collection',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/collection.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                collection:null,
                user:req.user
            }
        });
    }});
};

var collection_edit = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/collections/edit',
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
                    title:req.controllerData.collection.title+' - Edit Collection',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/collection.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                collection: req.controllerData.collection,
                user:req.user
            }
        });
    }});
};

var assets_index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/assets/index',
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
                    title:'Assets',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/asset.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                assets: req.controllerData.assets,
                user:req.user
            }
        });
    }});
};

var assets_show = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/assets/show',
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
                    title:req.controllerData.asset.title+' - Edit Assets',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/assets.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                asset: req.controllerData.asset,
                user:req.user
            }
        });
    }});
};

var contenttypes_index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/contenttypes/index',
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
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                contenttypes: req.controllerData.contenttypes,
                user:req.user
            }
        });
    }});
};

var contenttype_show = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/contenttypes/show',
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
                    title:req.controllerData.contenttype.title+' - Edit Content Types',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/contenttype.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                contenttype: req.controllerData.contenttype,
                user:req.user
            }
        });
    }});
};

var tags_index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/tags/index',
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
                    title:'tag admin',
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                tags: req.controllerData.tags,
                user:req.user
            }
        });
    }});
};

var tag_show = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/tags/show',
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
                    title:req.controllerData.tag.title+' - Edit Tag',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/tag.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                tag: req.controllerData.tag,
                user:req.user
            }
        });
    }});
};

var categories_index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/categories/index',
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
                    title:'Category admin',
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                categories: req.controllerData.categories,
                user:req.user
            }
        });
    }});
};

var category_show = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/categories/show',
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
                    title:req.controllerData.category.title+' - Edit Tag',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/category.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                category: req.controllerData.category,
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
                    title:'Extensions',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/ext.js"],
                    extensions:applicationController.getAdminMenu()
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
                                title:req.controllerData.extension.name+' - Extension',
                                // headerjs: ["/extensions/periodicjs.ext.admin/javascripts/extshow.js"],
                                extensions:applicationController.getAdminMenu()
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

var loadThemes = function(req, res, next){
    var themedir = path.resolve(__dirname,'../../../../../content/themes/'),
    returnFiles =[];

    req.controllerData = (req.controllerData)?req.controllerData:{};

    fs.readdir(themedir,function(err,files){
        for(var x =0; x< files.length; x++){
            if(files[x].match('periodicjs.theme')){
                returnFiles.push(files[x]);
            }
        }
        if(err){
            applicationController.handleDocumentQueryErrorResponse({
                err:err,
                res:res,
                req:req
            });
        }
        else{
            req.controllerData.themes = returnFiles;
            next();
        }
    });
};

var themes_index = function(req, res, next) {
    applicationController.getPluginViewTemplate({
    res:res,
    req:req,
    viewname:'p-admin/themes/index',
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
                    title:'Themes',
                    headerjs: ["/extensions/periodicjs.ext.admin/javascripts/theme.js"],
                    extensions:applicationController.getAdminMenu()
                },
                periodic:{
                    version: appSettings.version
                },
                posts: false,
                themes: req.controllerData.themes,
                activetheme: appSettings.theme,
                user:req.user
            }
        });
    }});
};
var theme_show = function(req, res, next){
    var themename = req.params.id,
        Themes = require(path.join(process.cwd(),'app/lib/themes')),
        themeRouteConf = Themes.getThemeRouteFilePath(themename),
        themePackageConf = Themes.getThemePeriodicConfFilePath(themename);

    // an example using an object instead of an array
    async.parallel({
        packagefile: function(callback){
            fs.readJson(themePackageConf, callback);
        },
        routefile: function(callback){
            fs.readFile(themeRouteConf,'utf8', callback);
        }
    },
    function(err, results) {
        if(err){
            console.log("async callback err",themename,err);
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
                viewname:'p-admin/themes/show',
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
                                title:req.controllerData.theme.name+' - Theme',
                                // headerjs: ["/extensions/periodicjs.ext.admin/javascripts/theme.js"],
                                extensions:applicationController.getAdminMenu()
                            },
                            periodic:{
                                version: appSettings.version
                            },
                            themedata:results,
                            theme: req.controllerData.theme,
                            user:req.user
                        }
                    });
                }});
        }
    });
};
var loadTheme = function(req, res, next){
    var selectedTheme = req.params.id;

    req.controllerData = req.controllerData || {};
    req.controllerData.theme = {
        name:selectedTheme,
        activetheme:appSettings.theme
    };
    if(selectedTheme){
        next();
    }
    else{
        next(new Error("no theme selected"));
    }
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	
	return{
		index:index,
        mail_index:mail_index,
        posts_index:posts_index,
        post_new:post_new,
        post_edit:post_edit,
        collections_index:collections_index,
        collection_new:collection_new,
        collection_edit:collection_edit,
        extensions_index:extensions_index,
        loadExtensions:loadExtensions,
        loadExtension:loadExtension,
        extension_show:extension_show,
        themes_index:themes_index,
        loadThemes:loadThemes,
        loadTheme:loadTheme,
        theme_show:theme_show,
        contenttypes_index:contenttypes_index,
        contenttype_show:contenttype_show,
        tags_index:tags_index,
        tag_show:tag_show,
        categories_index:categories_index,
        category_show:category_show,
        assets_index:assets_index,
        assets_show:assets_show
	};
};

module.exports = controller;