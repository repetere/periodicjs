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
};

module.exports = applicationController;