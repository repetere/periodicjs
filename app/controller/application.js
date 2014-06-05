'use strict';

var path = require('path'),
	fs = require('fs');

var applicationController = function(resources){
	var logger = resources.logger;
	var theme = resources.settings.theme;
	// logger.info(resources);
	// this.attr = true;
	function isValidObjectID(str) {
		// coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
		str = str + '';
		var len = str.length,
			valid = false;
		if (len === 12 || len === 24) {
			valid = /^[0-9a-fA-F]+$/.test(str);
		}
		return valid;
	}
	this.getPluginViewTemplate = function(options){
		var callback = options.callback,
			templatePath = options.templatePath, // user/login
			pluginname = options.pluginname, //periodicjs.plugin.login
			themepath = options.themepath,
			viewname = options.viewname,
			themefileext = options.themefileext,
			req = options.req,
			res = options.res;

		//theme path
		var themetemplatefile = path.join(themepath,'views',viewname+'.'+themefileext),
			plugintemplatefile = path.join(process.cwd(),'content/extensions/node_modules',pluginname,'views',viewname+'.'+themefileext);
		// console.log("themetemplatefile",themetemplatefile);
		// console.log("plugintemplatefile",plugintemplatefile);
		fs.open(themetemplatefile,'r',function(err,file){
			if(err){
				fs.open(plugintemplatefile,'r',function(err,pluginfile){
					if(err){
						this.handleDocumentQueryErrorResponse({err:err,res:res,req:req});
					}
					else{
						callback(plugintemplatefile);

					}
				}.bind(this));
			}
			else{
				callback(themetemplatefile);
			}
		}.bind(this));
	}.bind(this);

	this.getViewTemplate = function(options){
		var callback = options.callback,
			templatetype = options.templatetype,
			themepath = options.themepath,
			id = options.id,
			req = options.req,
			res = options.res,
			themefileext = options.themefileext,
			templatepath = 'home/index',
			templateFolder,
			templateFolderFiles,
			templateFile,
			templateFileBasename;

		switch(templatetype){
			case 'post-single':
				templateFolder = path.join(themepath,'views/post/');
				fs.readdir(templateFolder,function (err,files){
					if(err){
						this.handleDocumentQueryErrorResponse({err:err,res:res,req:req});
					}
					else{
						templateFolderFiles = files;
						for(var i =0; i<templateFolderFiles.length; i++){
							templateFileBasename = path.basename(templateFolderFiles[i],'.'+themefileext);
							if(templateFileBasename==='single-'+id){
								callback(path.join(templateFolder,templateFileBasename));
								break;
							}
							else{
								callback(path.join(templateFolder,'single'));
								break;
							}
						}
					}
				}.bind(this));
				break;
			default:
				callback(templatepath);
				break;
		}
	}.bind(this);

	this.loadModel = function(options) {
		var model = options.model,
			docid = options.docid,
			callback = options.callback;

		if (isValidObjectID(docid)) {
			model.findOne({
				$or: [{
				name: docid
				}, {
				_id: docid
				}]
			},
			function(err,doc){
				callback(err,doc);
			});
		}
		else {
			model.findOne({
				name: docid
			},
			function(err,doc){
				callback(err,doc);
			});
		}
	};

	this.handleDocumentQueryRender = function(options){
		var res = options.res,
			req = options.req;
		options.responseData.flash_messages = req.flash();
		if(req.query.format === "json") {
			res.send(options.responseData);
		}
		else{
			res.render(options.renderView,options.responseData);
		}
	};

	this.handleDocumentQueryErrorResponse = function(options){
		var err = options.err,
			redirectUrl = options.redirectUrl,
			req = options.req,
			res = options.res,
			callback = options.callback;

		if(req.query.format === "json") {
			res.send({
				"result": "error",
				"data": {
					error: err
				}
			});
		}
		else {
			if(options.flashError){
				req.flash('error', options.errorFlash);
			}
			if(callback){
				callback();
			}
			else if(redirectUrl){
				res.redirect(redirectUrl);
			}
			else{
				res.redirect('/404');
			}
		}
	};

	this.removeEmptyObjectValues = function(obj) {
		for (var property in obj) {
			if (typeof obj[property] === "object") {
				this.removeEmptyObjectValues(obj[property]);
			}
			else {
				if (obj[property] === '' || obj[property] === ' ' || obj[property] === null || obj[property] === undefined || Object.keys(obj).length === 0) {
				delete obj[property];
				}
			}
		}
		return obj;
	}.bind(this);
};

module.exports = applicationController;