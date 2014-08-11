'use strict';

var path = require('path'),
	merge = require('utils-merge'),
	fs = require('fs-extra');

var applicationController = function (resources) {
	var logger = resources.logger;
	var theme = resources.settings.theme;
	var appSettings = resources.settings;

	this.isValidObjectID = function (str) {
		// coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
		str = str + '';
		var len = str.length,
			valid = false;
		if (len === 12 || len === 24) {
			valid = /^[0-9a-fA-F]+$/.test(str);
		}
		return valid;
	};

	this.run_cmd = function (cmd, args, callBack) {
		var spawn = require('child_process').spawn;
		var child = spawn(cmd, args);
		var resp = '';

		child.stdout.on('data', function (buffer) {
			resp += buffer.toString();
		});
		child.stdout.on('end', function () {
			callBack(resp);
		});
		//run_cmd( "ls", ["-l"], function(text) { console.log (text) });
	};

	this.async_run_cmd = function (cmd, args, asynccallback, callback) {
		logger.silly('cmd', cmd);
		logger.silly('args', args);
		var spawn = require('child_process').spawn;
		var child = spawn(cmd, args);
		// var resp = '';

		child.stdout.on('error', function (err) {
			console.log('got error callback');
			callback(err, null);
		});
		child.stdout.on('data', function (buffer) {
			asynccallback(buffer.toString());
		});
		child.stderr.on('data', function (buffer) {
			asynccallback(buffer.toString());
		});
		//  child.stdout.on('end', function() {
		// console.log('got stdout end callback');
		// callback(null,"command run: "+cmd+" "+args);
		//  });
		//  child.stderr.on('end', function() {
		// console.log("got stderr end callback");
		// callback(null,"command run: "+cmd+" "+args);
		//  });
		child.on('exit', function () {
			logger.silly('got exit callback');
			callback(null, 'command run: ' + cmd + ' ' + args);
		}); //run_cmd( "ls", ["-l"], function(text) { console.log (text) });
	};

	this.restart_app = function () {
		var d = new Date(),
			restartfile = path.join(process.cwd(), '/content/extensions/restart.json');

		logger.silly('application restarted');
		fs.outputFile(restartfile, 'restart log ' + d + '- \r\n ', function (err) {
			if (err) {
				logger.error(err);
			}
		});
	};

	this.getPluginViewDefaultTemplate = function (options, callback) {
		var extname = options.extname || '',
			themename = theme,
			viewname = options.viewname,
			themefileext = options.themefileext;

		var getExtensionView = function (viewname, callback) {
			if (extname) {
				var exttemplatefile = path.join(path.resolve(process.cwd(), './node_modules', extname), 'views', viewname + '.' + themefileext);
				// console.log("exttemplatefile",exttemplatefile);
				fs.open(exttemplatefile, 'r', function (err) {
					if (err) {
						callback(err, viewname, null);
					}
					else {
						callback(null, viewname, exttemplatefile);
					}
				});
			}
			else {
				callback(null, viewname, viewname);
			}
		}.bind(this);

		var getThemeView = function (viewname, callback) {
			if (theme) {
				var themetemplatefile = path.join(path.resolve(__dirname, '../../content/themes'), themename, 'views', viewname + '.' + themefileext);
				// console.log("themetemplatefile",themetemplatefile);
				fs.open(themetemplatefile, 'r', function (err) {
					if (err) {
						callback(err, viewname, null);
					}
					else {
						callback(null, viewname, themetemplatefile);
					}
				});
			}
			else {
				callback(null, viewname, viewname);
			}
		}.bind(this);

		getThemeView(viewname, function (err, defaultview, themeview) {
			if (err) {
				getExtensionView(defaultview, function (err, defaultview, extname) {
					if (err) {
						callback(null, defaultview);
					}
					else {
						callback(null, extname);
					}
				});
			}
			else {
				callback(null, themeview);
			}
		});
	}.bind(this);

	this.getPluginViewTemplate = function (options) {
		var callback = options.callback,
			// templatePath = options.templatePath || '', // user/login
			pluginname = options.pluginname, //periodicjs.plugin.login
			themepath = options.themepath || '',
			viewname = options.viewname,
			themefileext = options.themefileext,
			req = options.req,
			res = options.res;

		//theme path
		var themetemplatefile = path.join(themepath, 'views', viewname + '.' + themefileext),
			plugintemplatefile = path.join(process.cwd(), 'content/extensions/node_modules', pluginname, 'views', viewname + '.' + themefileext);
		// console.log("themetemplatefile",themetemplatefile);
		// console.log("plugintemplatefile",plugintemplatefile);
		fs.open(themetemplatefile, 'r', function (err) {
			if (err) {
				fs.open(plugintemplatefile, 'r', function (err) {
					if (err) {
						this.handleDocumentQueryErrorResponse({
							err: err,
							res: res,
							req: req
						});
					}
					else {
						callback(plugintemplatefile);

					}
				}.bind(this));
			}
			else {
				callback(themetemplatefile);
			}
		}.bind(this));
	}.bind(this);

	this.getViewTemplate = function (options) {
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


		function singleTemplateFileCheck(templatefile, defaultfile, callback) {
			fs.open(templatefile, 'r', function (err) {
				if (err) {
					fs.open(defaultfile, 'r', function (err) {
						if (err) {
							self.handleDocumentQueryErrorResponse({
								err: err,
								res: res,
								req: req
							});
						}
						else {
							callback(defaultfile);
						}
					});
				}
				else {
					callback(templatefile);
				}
			});
		}

		switch (templatetype) {
		case 'post-single':
			templateFolder = path.join(themepath, 'views/post/');
			fs.readdir(templateFolder, function (err, files) {
				if (err) {
					this.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else {
					templateFolderFiles = files;
					for (var i = 0; i < templateFolderFiles.length; i++) {
						templateFileBasename = path.basename(templateFolderFiles[i], '.' + themefileext);
						if (templateFileBasename === 'single-' + id) {
							callback(path.join(templateFolder, templateFileBasename));
							break;
						}
						else {
							callback(path.join(templateFolder, 'single'));
							break;
						}
					}
				}
			}.bind(this));
			break;
		case 'search-results':
			defaultFile = path.join(process.cwd(), 'app/views/search', 'index.' + themefileext),
			templateFile = path.join(themepath, 'views', 'search/index.' + themefileext);
			singleTemplateFileCheck(templateFile, defaultFile, callback);
			break;
		case 'home-index':
			defaultFile = path.join(process.cwd(), 'app/views/home', 'index.' + themefileext),
			templateFile = path.join(themepath, 'views', 'home/index.' + themefileext);
			singleTemplateFileCheck(templateFile, defaultFile, callback);
			break;
		case 'home-404':
			defaultFile = path.join(process.cwd(), 'app/views/home', 'error404.' + themefileext);
			templateFile = path.join(themepath, 'views', 'home/error404.' + themefileext);
			singleTemplateFileCheck(templateFile, defaultFile, callback);
			break;
		default:
			callback(templatepath);
			break;
		}

	}.bind(this);

	this.loadModel = function (options) {
		var model = options.model,
			docid = options.docid,
			sort = options.sort,
			callback = options.callback,
			population = options.population,
			selection = options.selection,
			query;

		if (this.isValidObjectID(docid)) {
			query = {
				$or: [{
					name: docid
				}, {
					_id: docid
				}]
			};
		}
		else if (options.searchusername) {
			query = {
				$or: [{
					name: docid
				}, {
					username: docid
				}]
			};
		}
		else {
			query = {
				name: docid
			};
		}

		if (population) {
			model.findOne(query).sort(sort).select(selection).populate(population).exec(callback);
		}
		else {
			model.findOne(query).sort(sort).select(selection).exec(callback);
		}
	}.bind(this);

	this.searchModel = function (options) {
		var model = options.model,
			query = options.query,
			sort = options.sort,
			offset = options.offset,
			selection = options.selection,
			limit = options.limit,
			callback = options.callback,
			population = options.population;

		sort = (sort) ? sort : '-createdat';
		offset = (offset) ? offset : 0;
		limit = (limit || limit > 200) ? limit : 30;

		if (population) {
			model.find(query).sort(sort).select(selection).limit(limit).skip(offset).populate(population).exec(callback);
		}
		else {
			model.find(query).sort(sort).select(selection).limit(limit).skip(offset).exec(callback);
		}
	};

	this.createModel = function (options) {
		var model = options.model,
			newdoc = options.newdoc,
			req = options.req,
			res = options.res,
			successredirect = options.successredirect,
			// failredirect = options.failredirect,
			appendid = options.appendid,
			responseData = {};

		model.create(newdoc, function (err, saveddoc) {
			// console.log("createModel err",err);
			// console.log("createModel saveddoc",saveddoc);
			if (err) {
				this.handleDocumentQueryErrorResponse({
					err: err,
					errorflash: err.message,
					res: res,
					req: req
				});
			}
			else {
				if (req.query.format === 'json' || req.params.ext === 'json') {
					req.flash('success', 'Saved');
					responseData.result = 'success';
					responseData.data = {};
					responseData.data.flash_messages = req.flash();
					responseData.data.doc = saveddoc;
					res.send(responseData);
				}
				else if (appendid) {
					req.flash('success', 'Saved');
					res.redirect(successredirect + saveddoc._id);
				}
				else {
					req.flash('success', 'Saved');
					res.redirect(successredirect);
				}
			}
		}.bind(this));
	}.bind(this);

	this.updateModel = function (options) {
		var model = options.model,
			id = options.id,
			updatedoc = options.updatedoc,
			req = options.req,
			res = options.res,
			successredirect = options.successredirect,
			failredirect = options.failredirect,
			appendid = options.appendid,
			responseData = {},
			updateOperation;

		if (options.removeFromArray) {
			logger.silly('removing array in doc');
			updateOperation = {
				$pull: updatedoc
			};
		}
		else if (options.appendArray) {
			logger.silly('appending array in doc');
			updateOperation = {
				$push: updatedoc
			};
		}
		else {
			logger.silly('updating entire doc');
			updateOperation = {
				$set: updatedoc
			};
		}

		model.findByIdAndUpdate(id, updateOperation, function (err, saveddoc) {
			if (err) {
				this.handleDocumentQueryErrorResponse({
					err: err,
					errorflash: err.message,
					res: res,
					req: req
				});
			}
			else {
				if (req.query.format === 'json' || req.params.ext === 'json') {
					req.flash('success', 'Saved');
					responseData.result = 'success';
					responseData.data = {};
					responseData.data.flash_messages = req.flash();
					if (options.population) {
						model.findOne({
							_id: saveddoc._id
						}).populate(options.population).exec(function (err, popdoc) {
							if (err) {
								responseData.data.docpopulationerror = err;
								responseData.data.status = 'couldnt populate';
								responseData.data.doc = saveddoc;
								res.send(responseData);
							}
							else {
								responseData.data.doc = popdoc;
								res.send(responseData);
							}
						});
					}
					else {
						responseData.data.doc = saveddoc;
						res.send(responseData);
					}
				}
				else if (appendid) {
					req.flash('success', 'Saved');
					res.redirect(successredirect + saveddoc._id);
				}
				else {
					req.flash('success', 'Saved');
					res.redirect(successredirect);
				}
				//save revision
				var changesetdata = updatedoc;
				if (changesetdata.docid) {
					delete changesetdata.docid;
				}
				if (changesetdata._csrf) {
					delete changesetdata._csrf;
				}
				if (changesetdata.save_button) {
					delete changesetdata.save_button;
				}
				if (options.saverevision) {
					model.findByIdAndUpdate(
						id, {
							$push: {
								'changes': {
									changeset: updatedoc
								}
							}
						},
						// {safe: true, upsert: true},
						function (err) {
							if (err) {
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
		Contact.findByIdAndUpdate(
		    info._id,
		    {$push: {"messages": {title: title, msg: msg}}},
		    {safe: true, upsert: true},
		    function(err, model) {
		        console.log(err);
		    }
		);
		*/
	}.bind(this);

	this.deleteModel = function (options) {
		var model = options.model,
			deleteid = options.deleteid,
			// req = options.req,
			// res = options.res,
			callback = options.callback;

		model.remove({
			_id: deleteid
		}, callback);
	}.bind(this);

	this.loadExtensions = function (options) {
		var periodicsettings = options.periodicsettings,
			callback = options.callback;
		try {
			var ExtentionLoader = require('periodicjs.core.extensions'),
				extensions = new ExtentionLoader(periodicsettings);
			callback(null, extensions.settings().extensions);
		}
		catch (err) {
			callback(err, null);
		}
	}.bind(this);

	this.handleDocumentQueryRender = function (options) {
		var res = options.res,
			req = options.req,
			redirecturl = options.redirecturl,
			err = options.err,
			callback = options.callback,
			responseData = options.responseData;

		if (err) {
			this.handleDocumentQueryErrorResponse({
				res: res,
				req: req,
				err: err,
				callback: callback,
				redirecturl: redirecturl
			});
		}
		else {
			responseData.periodic = responseData.periodic || {};
			responseData.periodic.version = appSettings.version;
			responseData.periodic.name = appSettings.name;
			responseData.request = {
				query: req.query,
				params: req.params,
				baseurl: req.baseUrl,
				originalurl: req.originalUrl,
				parsed: req._parsedUrl
			};

			responseData.flash_messages = req.flash();
			if (req.query.format === 'json' || req.params.ext === 'json') {
				res.send(responseData);
			}
			else if (req.query.callback) {
				res.jsonp(responseData);
			}
			else if (options.redirecturl) {
				res.redirect(options.redirecturl);
			}
			else {
				res.render(options.renderView, responseData);
			}
		}
		if (callback) {
			callback();
		}
	}.bind(this);

	this.handleDocumentQueryErrorResponse = function (options) {
		var err = options.err,
			errormessage = (typeof options.err === 'string') ? options.err : options.err.message,
			redirecturl = options.redirecturl,
			req = options.req,
			res = options.res,
			callback = options.callback;//,
			// errorFlashMessage = (options.errorflash) ? options.errorflash : errormessage;

		res.status(400);

		logger.error(err.stack);
		logger.error(errormessage, req.url);
		if (req.query.format === 'json') {
			res.send({
				'result': 'error',
				'data': {
					error: errormessage
				}
			});
		}
		else {
			if (options.errorflash !== false) {
				req.flash('error', errormessage);
			}
			if (callback) {
				callback();
			}
			else if (redirecturl) {
				res.redirect(redirecturl);
			}
			else {
				var self = this;
				self.getPluginViewDefaultTemplate({
						viewname: 'home/error404',
						themefileext: appSettings.templatefileextension
					},
					function (err, templatepath) {
						self.handleDocumentQueryRender({
							res: res,
							req: req,
							renderView: templatepath,
							responseData: {
								pagedata: {
									title: 'Not Found'
								},
								user: req.user,
								url: req.url
							}
						});
					}
				);
			}
		}
	}.bind(this);

	this.removeEmptyObjectValues = function (obj) {
		for (var property in obj) {
			if (typeof obj[property] === 'object') {
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

	this.removePrivateInfo = function (obj) {
		// console.log("removePrivateInfo obj",obj);
		if (typeof obj === 'object') {
			obj.password = null;
			obj.apikey = null;
			obj.random = null;
		}
		return obj;
	}.bind(this);

	this.stripTags = function (textinput) {
		if (textinput) {
			return textinput.replace(/[^a-z0-9@._]/gi, '-').toLowerCase();
		}
		else {
			return false;
		}
	};

	this.makeNiceName = function (username) {
		if (username) {
			return username.replace(/[^a-z0-9]/gi, '-').toLowerCase();
		}
		else {
			return false;
		}
	};
	this.makeNiceAttribute = function (username) {
		if (username) {
			return username.replace(/[^a-z0-9]/gi, '_').toLowerCase();
		}
		else {
			return false;
		}
	};

	this.sortObject = function (dir, field) {
		var comparefunction;
		if (dir === 'desc') {
			comparefunction = function (a, b) {
				if (a[field] < b[field]) {
					return 1;
				}
				if (a[field] > b[field]) {
					return -1;
				}
				return 0;
			};
		}
		else {
			comparefunction = function (a, b) {
				if (a[field] < b[field]) {
					return -1;
				}
				if (a[field] > b[field]) {
					return 1;
				}
				return 0;
			};
		}

		return comparefunction;
	};

	this.getAdminMenu = function (options) {
		var adminmenu = {
			menu: {
				Content: {},
				Themes: {},
				Extensions: {},
				Settings: {},
				User: {}
			}
		};
		logger.silly(options);
		for (var x in appSettings.extconf.extensions) {
			if (appSettings.extconf.extensions[x].enabled === true && appSettings.extconf.extensions[x].periodicConfig['periodicjs.ext.admin']) {
				var extmenudata = appSettings.extconf.extensions[x].periodicConfig['periodicjs.ext.admin'];
				// console.log("before adminmenu",adminmenu);
				if (extmenudata.menu.Content) {
					adminmenu.menu.Content = merge(extmenudata.menu.Content, adminmenu.menu.Content);
				}
				if (extmenudata.menu.Themes) {
					adminmenu.menu.Themes = merge(extmenudata.menu.Themes, adminmenu.menu.Themes);
				}
				if (extmenudata.menu.Extensions) {
					adminmenu.menu.Extensions = merge(extmenudata.menu.Extensions, adminmenu.menu.Extensions);
				}
				if (extmenudata.menu.Settings) {
					adminmenu.menu.Settings = merge(extmenudata.menu.Settings, adminmenu.menu.Settings);
				}
				if (extmenudata.menu.User) {
					adminmenu.menu.User = merge(extmenudata.menu.User, adminmenu.menu.User);
				}
				// console.log("after adminmenu",adminmenu);
			}
		}
		return adminmenu;
	};
};

module.exports = applicationController;
