'use strict';

var path = require('path'),
	appController = require(path.join(process.cwd(),'app/controller/application')),
    extend = require('util-extend'),
    async = require('async'),
    fs = require('fs-extra'),
    moment = require('moment'),
    CronJob = require('cron').CronJob,
	applicationController,
	appSettings,
	mongoose,
    User,
    Collection,
    Item,//Post
    scheduled_itemid_array=[],
    scheduled_collectionid_array=[],
	logger;

var index = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
            applicationController.handleDocumentQueryRender({
                res:res,
                req:req,
                renderView:templatepath,
                responseData:{
                    pagedata:{
                        title:'admin',
                        extensions:applicationController.getAdminMenu()
                    },
                    posts: recentposts,
                    user:req.user
                }
            });
        }
    );
};

var mail_index = function(req,res,next){
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/mailer/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    user:req.user
                }
            });
        }
    );
};

var posts_index = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/posts/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
            applicationController.handleDocumentQueryRender({
                res:res,
                req:req,
                renderView:templatepath,
                responseData:{
                    pagedata:{
                        title:'post admin',
                        extensions:applicationController.getAdminMenu()
                    },
                    posts: req.controllerData.posts,
                    user:req.user
                }
            });
        }
    );
};

var post_new = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/posts/new',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    post:null,
                    serverdate:moment().format("YYYY-MM-DD"),
                    servertime:moment().format("HH:mm"),
                    user:req.user
                }
            });
        }
    );
};

var post_edit = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/posts/edit',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    post: req.controllerData.post,
                    serverdate:moment(req.controllerData.post.publishat).format("YYYY-MM-DD"),
                    servertime:moment(req.controllerData.post.publishat).format("HH:mm"),
                    user:req.user
                }
            });
        }
    );
};

var collections_index = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/collections/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
            applicationController.handleDocumentQueryRender({
                res:res,
                req:req,
                renderView:templatepath,
                responseData:{
                    pagedata:{
                        title:'Collections',
                        extensions:applicationController.getAdminMenu()
                    },
                    collections: req.controllerData.collections,
                    user:req.user
                }
            });
        }
    );
};

var collection_new = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/collections/new',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    collection:null,
                    serverdate:moment().format("YYYY-MM-DD"),
                    servertime:moment().format("HH:mm"),
                    user:req.user
                }
            });
        }
    );
};

var collection_edit = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/collections/edit',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    collection: req.controllerData.collection,
                    serverdate:moment(req.controllerData.collection.publishat).format("YYYY-MM-DD"),
                    servertime:moment(req.controllerData.collection.publishat).format("HH:mm"),
                    user:req.user
                }
            });
        }
    );
};

var assets_index = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/assets/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    assets: req.controllerData.assets,
                    user:req.user
                }
            });
        }
    );
};

var assets_show = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/assets/show',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    asset: req.controllerData.asset,
                    user:req.user
                }
            });
        }
    );
};

var contenttypes_index = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/contenttypes/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
            applicationController.handleDocumentQueryRender({
                res:res,
                req:req,
                renderView:templatepath,
                responseData:{
                    pagedata:{
                        title:'content type admin',
                        extensions:applicationController.getAdminMenu()
                    },
                    contenttypes: req.controllerData.contenttypes,
                    user:req.user
                }
            });
        }
    );
};

var contenttype_show = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/contenttypes/show',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
        }
    );
};

var tags_index = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/tags/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
            applicationController.handleDocumentQueryRender({
                res:res,
                req:req,
                renderView:templatepath,
                responseData:{
                    pagedata:{
                        title:'tag admin',
                        extensions:applicationController.getAdminMenu()
                    },
                    tags: req.controllerData.tags,
                    user:req.user
                }
            });
        }
    );
};

var tag_show = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/tags/show',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
        }
    );
};

var categories_index = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/categories/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
            applicationController.handleDocumentQueryRender({
                res:res,
                req:req,
                renderView:templatepath,
                responseData:{
                    pagedata:{
                        title:'Category admin',
                        extensions:applicationController.getAdminMenu()
                    },
                    categories: req.controllerData.categories,
                    user:req.user
                }
            });
        }
    );
};

var category_show = function(req, res, next) {
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/categories/show',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
        }
    );
};

var loadExtension = function(req, res, next){
    var extname = req.params.id,
        extFilePath = path.resolve(process.cwd(),'content/extensions/extensions.json'),
        z=false,
        selectedExt,
        currentExtensions;

    fs.readJson(extFilePath,function(err,currentExtensionsJson){
        // console.log("currentExtensionsJson",currentExtensionsJson);
        if(err){
            next(err);
        }
        else{
            currentExtensions = currentExtensionsJson.extensions;
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
            req.controllerData.extensionx = z;
            next();
        }
    });
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
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/extensions/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    posts: false,
                    extensions: req.controllerData.extensions,
                    user:req.user
                }
            });
        }
    );
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
            applicationController.getPluginViewDefaultTemplate(
                {
                    viewname:'p-admin/extensions/show',
                    themefileext:appSettings.templatefileextension,
                    extname: 'periodicjs.ext.admin'
                },
                function(err,templatepath){
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
                            extdata:results,
                            extension: req.controllerData.extension,
                            user:req.user
                        }
                    });
                }
            );
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
    applicationController.getPluginViewDefaultTemplate(
        {
            viewname:'p-admin/themes/index',
            themefileext:appSettings.templatefileextension,
            extname: 'periodicjs.ext.admin'
        },
        function(err,templatepath){
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
                    posts: false,
                    themes: req.controllerData.themes,
                    activetheme: appSettings.theme,
                    user:req.user
                }
            });
        }
    );
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
            applicationController.getPluginViewDefaultTemplate(
                {
                    viewname:'p-admin/themes/show',
                    themefileext:appSettings.templatefileextension,
                    extname: 'periodicjs.ext.admin'
                },
                function(err,templatepath){
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
                            themedata:results,
                            theme: req.controllerData.theme,
                            user:req.user
                        }
                    });
                }
            );
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
    Item = mongoose.model('Post');
    Collection = mongoose.model('Collection');
	
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