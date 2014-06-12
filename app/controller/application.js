'use strict';

var path = require('path'),
	fs = require('fs');

var applicationController = function(resources){
	var logger = resources.logger;
	var theme = resources.settings.theme;

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
			templateFileBasename,
			defaultFile,
			self = this;


		function singleTemplateFileCheck(templatefile,defaultfile,callback){
			fs.open(templatefile,'r',function(err,file){
				if(err){
					fs.open(defaultfile,'r',function(err,pluginfile){
						if(err){
							self.handleDocumentQueryErrorResponse({err:err,res:res,req:req});
						}
						else{
							callback(defaultfile);
						}
					});
				}
				else{
					callback(templatefile);
				}
			});
		}

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
			case 'search-results':
				defaultFile = path.join(process.cwd(),'app/views/search','index.'+themefileext),
				templateFile = path.join(themepath,'views','search/index.'+themefileext);
				singleTemplateFileCheck(templateFile,defaultFile,callback);
				break;
			case 'home-index':
				defaultFile = path.join(process.cwd(),'app/views/home','index.'+themefileext),
				templateFile = path.join(themepath,'views','home/index.'+themefileext);
				singleTemplateFileCheck(templateFile,defaultFile,callback);
				break;
			case 'home-404':
				defaultFile = path.join(process.cwd(),'app/views/home','error404.'+themefileext);
				templateFile = path.join(themepath,'views','home/error404.'+themefileext);
				singleTemplateFileCheck(templateFile,defaultFile,callback);
				break;
			default:
				callback(templatepath);
				break;
		}

	}.bind(this);

	this.loadModel = function(options) {
		var model = options.model,
			docid = options.docid,
			callback = options.callback,
			population = options.population,
			query;

		if (isValidObjectID(docid)) {
			query = {
				$or: [{
				name: docid
				}, {
				_id: docid
				}]
			};
		}
		else {
			query = {
				name: docid
			};
		}

		if(population){
			model.findOne(query).populate(population).exec(callback);
		}
		else{
			model.findOne(query).exec(callback);
		}
	};

	this.searchModel = function(options){
		var	model = options.model,
			query = options.query,
			sort = options.sort,
			offset = options.offset,
			limit = options.limit,
			callback = options.callback,
			population = options.population;

		sort = (sort)? sort : '-createdat';
		offset = (offset)? offset : 0;
		limit = (limit || limit >200)? limit : 30;

		if(population){
			model.find(query).sort(sort).limit(limit).skip(offset).populate(population).exec(callback);
		}
		else{
			model.find(query).sort(sort).limit(limit).skip(offset).exec(callback);
		}
	};

	this.createModel = function(options) {
		var model = options.model,
			newdoc = options.newdoc,
			req = options.req,
			res = options.res,
			successredirect = options.successredirect,
			failredirect = options.failredirect,
			appendid = options.appendid,
			responseData={};

		model.create(newdoc,function(err,saveddoc){
			console.log("createModel err",err);
			if(err){
				this.handleDocumentQueryErrorResponse({err:err,errorflash:err.message,res:res,req:req});
			}
			else{
				if(req.query.format === "json" || req.params.ext === "json") {
					req.flash("success","Saved");
					responseData.result="success";
					responseData.data = {};
					responseData.data.flash_messages = req.flash();
					responseData.data.doc = saveddoc;
					res.send(responseData);
				}
				else if(appendid){
					req.flash("success","Saved");
					res.redirect(successredirect+saveddoc._id);
				}
				else{
					req.flash("success","Saved");
					res.redirect(successredirect);
				}
			}
		}.bind(this));
	}.bind(this);

	this.updateModel = function(options) {
		var model = options.model,
			id = options.id,
			updatedoc = options.updatedoc,
			req = options.req,
			res = options.res,
			successredirect = options.successredirect,
			failredirect = options.failredirect,
			appendid = options.appendid,
			responseData={};

		model.findByIdAndUpdate(id,{$set:updatedoc},function(err,saveddoc){
			if(err){
				this.handleDocumentQueryErrorResponse({err:err,errorflash:err.message,res:res,req:req});
			}
			else{
				if(req.query.format === "json" || req.params.ext === "json") {
					req.flash("success","Saved");
					responseData.result="success";
					responseData.data = {};
					responseData.data.flash_messages = req.flash();
					responseData.data.doc = saveddoc;
					res.send(responseData);
				}
				else if(appendid){
					req.flash("success","Saved");
					res.redirect(successredirect+saveddoc._id);
				}
				else{
					req.flash("success","Saved");
					res.redirect(successredirect);
				}
				//save revision
				var changesetdata = updatedoc;
				if(changesetdata.docid){delete changesetdata.docid;}
				if(changesetdata._csrf){delete changesetdata._csrf;}
				if(changesetdata.save_button){delete changesetdata.save_button;}
				if(options.saverevision){
					model.findByIdAndUpdate(
						id,
						{$push: {"changes": {changeset: updatedoc}}},
						// {safe: true, upsert: true},
						function(err, changesetdoc) {
							if(err){
								logger.error(err);
							}
						}
					);
				}
			}
		}.bind(this));
		/*
		Tank.findByIdAndUpdate(id, 
			{ $set: { size: 'large' }}, 
			function (err, tank) {
				if (err) return handleError(err);
				res.send(tank);
		});
		*/
	}.bind(this);

	this.handleDocumentQueryRender = function(options){
		var res = options.res,
			req = options.req;

		options.responseData.flash_messages = req.flash();
		if(req.query.format === "json" || req.params.ext === "json") {
			res.send(options.responseData);
		}
		else if(req.query.callback) {
			res.jsonp(options.responseData);
		}
		else{
			res.render(options.renderView,options.responseData);
		}
	};

	this.handleDocumentQueryErrorResponse = function(options){
		var err = options.err,
			errormessage = (typeof options.err === 'string')? options.err : options.err.message,
			redirecturl = options.redirecturl,
			req = options.req,
			res = options.res,
			callback = options.callback,
			errorFlashMessage = (options.errorflash) ? options.errorflash : errormessage;


		logger.error(err);
		logger.error(errormessage,req.url);
		if(req.query.format === "json") {
			res.send({
				"result": "error",
				"data": {
					error: errormessage
				}
			});
		}
		else {
			res.status(404);
			if(options.errorflash!==false){
				req.flash('error', errormessage);
			}
			if(callback){
				callback();
			}
			else if(redirecturl){
				res.redirect(redirecturl);
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

	this.removePrivateInfo = function(obj) {
		obj.password=null;
		obj.apikey=null;
		// console.log("removePrivateInfo obj",obj);
		return obj;
	}.bind(this);

	this.stripTags = function(textinput) {
		if (textinput) {
			return textinput.replace(/[^a-z0-9@._]/gi, '-').toLowerCase();
		}
		else {
			return false;
		}
	};

	this.makeNiceName = function(username) {
		if (username) {
			return username.replace(/[^a-z0-9]/gi, '-').toLowerCase();
		}
		else {
			return false;
		}
	};
};

module.exports = applicationController;