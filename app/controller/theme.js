'use strict';
// https://www.npmjs.org/package/decompress
var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	semver = require('semver'),
	Decompress = require('decompress'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	restartfile = path.join(process.cwd(), '/content/config/restart.json'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	User, Category, Item, Tag, Asset, Collection, Compilation, Contenttype;

	var repoversion,
		reponame,
		repourl,
		timestamp,
		logdir,
		logfile,
		themedir,
		themename,
		clitask;

var customLayout = function (options) {
	var req = options.req,
		res = options.res,
		next = options.next,
		parallelTask = {},
		layoutdata = options.layoutdata,
		layoutdatavarname = options.layoutdatavarname || 'layoutdata',
		pagetitle = (options.pagetitle) ? options.pagetitle : 'Periodic';

	Item = mongoose.model('Item');
	User = mongoose.model('User');
	Category = mongoose.model('Category');
	Tag = mongoose.model('Tag');
	Asset = mongoose.model('Asset');
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');

	function getModelFromName(modelname) {
		switch (modelname) {
		case 'Category':
			return Category;
		case 'Item':
			return Item;
		case 'Tag':
			return Tag;
		case 'User':
			return User;
		case 'Asset':
			return Asset;
		case 'Collection':
			return Collection;
		case 'Compilation':
			return Compilation;
		case 'Contenttype':
			return Contenttype;
		}
	}

	function getTitleNameQuerySearch(searchterm) {
		var searchRegEx = new RegExp(CoreUtilities.stripTags(searchterm), 'gi');

		if (searchterm === undefined || searchterm.length < 1) {
			return {};
		}
		else {
			return {
				$or: [{
					title: searchRegEx
				}, {
					'name': searchRegEx
				}]
			};
		}

	}

	function getAsyncCallback(functiondata) {
		var querydata = (functiondata.search.customquery) ? functiondata.search.customquery : getTitleNameQuerySearch(functiondata.search.query);
		return function (cb) {
			//console.log('functiondata.search.query', functiondata.search.query);
			CoreController.searchModel({
				cached: req.headers.periodicCache !== 'no-periodic-cache',
				model: getModelFromName(functiondata.model),
				query: querydata,
				sort: functiondata.search.sort,
				limit: functiondata.search.limit,
				offset: functiondata.search.offset,
				selection: functiondata.search.selection,
				population: functiondata.search.population,
				callback: cb
			});
		};
	}
	for (var x in layoutdata) {
		parallelTask[x] = getAsyncCallback(layoutdata[x]);
	}
	// an example using an object instead of an array
	async.parallel(
		parallelTask,
		function (err, results) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				if (next) {
					req.controllerData = (req.controllerData) ? req.controllerData : {};
					req.controllerData[layoutdatavarname] = results;
					next();
				}
				else {
					var viewpath = options.viewpath,
						extname = options.extname,
						responseData ={};

					CoreController.getPluginViewDefaultTemplate({
							viewname: viewpath,
							extname: extname,
							themefileext: appSettings.templatefileextension
						},
						function (err, templatepath) {
							responseData.pagedata = {
								title: pagetitle
							};
							responseData.periodic =  {
								version: appSettings.version
							};
							responseData.user = CoreUtilities.removePrivateInfo(req.user);
							responseData[layoutdatavarname] = results;
							CoreController.handleDocumentQueryRender({
								res: res,
								req: req,
								renderView: templatepath,
								responseData: responseData
							});
						}
					);
				}
			}
		});
};

var install_logErrorOutput = function (options) {
	var logfile = options.logfile,
		logdata = options.logdata + '\r\n ';
	logger.error(logdata);
	fs.appendFile(logfile, logdata + '====!!ERROR!!====', function (err) {
		if (err) {
			logger.error(err);
		}
		if (options.cli) {
			throw new Error(logdata);
		}
	});
};

var install_logOutput = function (options) {
	var logfile = options.logfile,
		logdata = options.logdata + '\r\n',
		callback = options.callback;

	fs.appendFile(logfile, logdata, function (err) {
		if (err) {
			logger.error(err);
			if (callback) {
				callback(err);
			}
			//try and write message to end console
			install_logErrorOutput({
				logfile: logfile,
				logdata: err.message
			});
		}
		else {
			if (callback) {
				callback(null);
			}
		}
	});
};

var updateConfigTheme = function (options) {
	var themename = options.themename,
		res = options.res,
		req = options.req,
		// next = options.next,
		confFilePath = path.join(process.cwd(), 'content/config/environment/'+appSettings.application.environment+'.json');

	fs.ensureFileSync(confFilePath);
	fs.readJson(confFilePath, function (err, configFileJson) {
		if (err) {
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
		else {
			configFileJson = configFileJson || {};
			configFileJson.theme = themename;

			fs.outputJson(
				confFilePath,
				configFileJson,
				function (err) {
					if (err) {
						CoreController.handleDocumentQueryErrorResponse({
							err: err,
							res: res,
							req: req,
							redirecturl: '/p-admin/themes'
						});
					}
					else {
						CoreController.handleDocumentQueryRender({
							req: req,
							res: res,
							redirecturl: '/p-admin/themes',
							responseData: {
								result: 'success',
								data: {
									theme: themename,
									msg: 'theme enabled'
								}
							},
							callback: function () {
								CoreUtilities.restart_app({
									restartfile: restartfile
								});
							}
						});
					}
				}
			);
		}
	});
};

var getThemeConfig = function (options) {
	var themeConfigFile = path.join(process.cwd(), 'content/config/themes', options.themename, 'periodicjs.theme.json');
	fs.readJson(themeConfigFile, options.callback);
};

var enable = function (req, res, next) {
	var themename = req.params.id; //,
	// currentTheme = appSettings.theme;

	getThemeConfig({
		themename: themename,
		callback: function (err, themedata) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				try {
					if (!semver.lte(
						themedata.periodicCompatibility, appSettings.version)) {
						CoreController.handleDocumentQueryErrorResponse({
							err: new Error('This theme requires periodic version: ' + themedata.periodicCompatibility + ' not: ' + appSettings.version),
							res: res,
							req: req
						});
					}
					else {
						updateConfigTheme({
							themename: themename,
							req: req,
							res: res,
							next: next
						});
					}
				}
				catch (e) {
					CoreController.handleDocumentQueryErrorResponse({
						err: e,
						res: res,
						req: req
					});
				}
			}
		}
	});
};

var uninstall_removeFiles = function (options) {
	var themedir = options.themedir,
		// repourl = options.repourl,
		themename = options.themename,
		logfile = options.logfile;

	fs.remove(path.resolve(themedir, themename), function (err) {
		if (err) {
			logger.error(err);
		}
		else {
			// install_removeThemeFromConf({
			// 	logfile : logfile,
			// 	themename: themename
			// });
			install_logOutput({
				logfile: logfile,
				logdata: themename + ' removed, application restarting \r\n  ====##REMOVED-END##====',
				callback: function () {}
			});

			fs.remove(path.resolve(__dirname, '../../public/themes/', themename), function (err) {
				if (err) {
					logger.error(err);
				}
				else {
					logger.info('removed theme public dir files');
				}
			});
		}
	});
};

var remove = function (req, res) {
	var themename = req.params.id,
		timestamp = (new Date()).getTime(),
		logdir = path.resolve(__dirname, '../../content/themes/log/'),
		logfile = path.join(logdir, 'remove-theme.' + req.user._id + '.' + CoreUtilities.makeNiceName(themename) + '.' + timestamp + '.log'),
		myData = {
			result: 'start',
			data: {
				message: 'beginning theme removal: ' + themename,
				time: timestamp
			}
		},
		themedir = path.join(process.cwd(), 'content/themes');

	if (themename === appSettings.theme) {
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('Cannot delete active theme'),
			res: res,
			req: req
		});
	}
	else {
		install_logOutput({
			logfile: logfile,
			logdata: myData.data.message,
			callback: function (err) {
				if (err) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else {
					CoreController.handleDocumentQueryRender({
						res: res,
						req: req,
						responseData: {
							result: 'success',
							data: {
								repo: CoreUtilities.makeNiceName(themename),
								themename: themename,
								time: timestamp
							}
						}
					});
					uninstall_removeFiles({
						themedir: themedir,
						logfile: logfile,
						themename: themename
					});
				}
			}
		});
	}
};

var remove_getOutputLog = function (req, res) {
	var logdir = path.resolve(__dirname, '../../content/themes/log/'),
		themename = (req.query.makenice) ? req.params.theme : CoreUtilities.makeNiceName(req.params.theme),
		logfile = path.join(logdir, 'remove-theme.' + req.user._id + '.' + themename + '.' + req.params.date + '.log'),
		stat = fs.statSync(logfile),
		readStream = fs.createReadStream(logfile);

	res.writeHead(200, {
		'Content-Type': ' text/plain',
		'Content-Length': stat.size
	});

	// We replaced all the event handlers with a simple call to readStream.pipe()
	// http://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback
	// http://visionmedia.github.io/superagent/#request-timeouts
	// http://stackoverflow.com/questions/10046039/nodejs-send-file-in-response
	readStream.pipe(res);
};

var install_getOutputLog = function (req, res) {
	var logdir = path.resolve(__dirname, '../../content/themes/log/'),
		logfile = path.join(logdir, 'install-theme.' + req.user._id + '.' + CoreUtilities.makeNiceName(req.params.theme) + '.' + req.params.date + '.log'),
		stat = fs.statSync(logfile),
		readStream = fs.createReadStream(logfile);

	res.writeHead(200, {
		'Content-Type': ' text/plain',
		'Content-Length': stat.size
	});

	// We replaced all the event handlers with a simple call to readStream.pipe()
	// http://nodejs.org/api/fs.html#fs_fs_writefile_filename_data_options_callback
	// http://visionmedia.github.io/superagent/#request-timeouts
	// http://stackoverflow.com/questions/10046039/nodejs-send-file-in-response
	readStream.pipe(res);
};

var upload_getOutputLog = function (req, res) {
	var logdir = path.resolve(__dirname, '../../content/themes/log/'),
		logfile = path.join(logdir, 'install-theme.' + req.user._id + '.' + req.params.theme + '.' + req.params.date + '.log'),
		stat = fs.statSync(logfile),
		readStream = fs.createReadStream(logfile);

	res.writeHead(200, {
		'Content-Type': ' text/plain',
		'Content-Length': stat.size
	});

	readStream.pipe(res);
};

var remove_clilog = function (options) {
	fs.remove(options.logfile, function (err) {
		if (err) {
			install_logErrorOutput({
				logfile: options.logfile,
				logdata: err.message,
				cli: options.cli
			});
		}
		else {
			logger.info(options.themename + ' log removed \r\n  ====##END##====');
		}
	});
};

var cleanup_log = function (req, res) {
	var logdir = path.resolve(__dirname, '../../content/themes/log/'),
		themename = (req.query.makenice) ? req.params.theme : CoreUtilities.makeNiceName(req.params.theme),
		logfile = path.join(logdir, req.query.mode + '-theme.' + req.user._id + '.' + themename + '.' + req.params.date + '.log');

	fs.remove(logfile, function (err) {
		if (err) {
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
		else {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				responseData: {
					result: 'success',
					data: {
						msg: 'removed log file'
					}
				}
			});
		}
	});
};

var install_themePublicDir = function (options) {
	var logfile = options.logfile,
		themename = options.themename,
		themedir = path.resolve(__dirname, '../../content/themes/', themename, 'public'),
		themepublicdir = path.resolve(__dirname, '../../public/themes/', themename);
	// console.log('extname',extname);
	fs.readdir(themedir, function (err
		//, files
	) {
		// console.log('files',files);
		if (err) {
			install_logOutput({
				logfile: logfile,
				logdata: 'No Public Directory to Copy',
				callback: function () {
					install_logOutput({
						logfile: logfile,
						logdata: themename + ' installed, application restarting \r\n  ====##END##====',
						callback: function () {}
					});
					if (options.cli) {
						logger.info(themename + ' installed \r\n  ====##END##====');
						remove_clilog({
							logfile: logfile,
							themename: themename
						});
						process.exit(0);
					}
				}
			});
		}
		else {
			//make destination dir
			fs.mkdirs(themepublicdir, function (err) {
				if (err) {
					install_logErrorOutput({
						logfile: logfile,
						logdata: err.message,
						cli: options.cli
					});
				}
				else {
					fs.copy(themedir, themepublicdir, function (err) {
						if (err) {
							install_logErrorOutput({
								logfile: logfile,
								logdata: err.message,
								cli: options.cli
							});
						}
						else {
							install_logOutput({
								logfile: logfile,
								logdata: 'Copied public files',
								callback: function () {
									install_logOutput({
										logfile: logfile,
										logdata: themename + ' installed, application restarting \r\n  ====##END##====',
										callback: function () {}
									});
									if (options.cli) {
										logger.info(themename + ' installed \r\n  ====##END##====');
										remove_clilog({
											logfile: logfile,
											themename: themename
										});
										process.exit(0);
									}
								}
							});
						}
					});
				}
			});
		}
	});
};

var install_viaDownload = function (options) {
	var themedir = options.themedir,
		repourl = options.repourl,
		reponame = options.reponame,
		logfile = options.logfile,
		downloadtothemedir = path.join(themedir, reponame.split('/')[1]),
		download = require('download'),
		dlsteam;
	// console.log('downloadtothemedir',downloadtothemedir);
	fs.ensureDir(downloadtothemedir, function (err) {
		if (err) {
			install_logErrorOutput({
				logfile: logfile,
				logdata: err.message,
				cli: true
			});
		}
		else {
			dlsteam = download(repourl, downloadtothemedir, {
				extract: true,
				strip: 1
			});
			dlsteam.on('response', function () {
				install_logOutput({
					logfile: logfile,
					logdata: reponame + ' starting download'
				});
			});
			dlsteam.on('data', function () {
				install_logOutput({
					logfile: logfile,
					logdata: 'downloading data'
				});
				logger.info('downloading data');
			});
			dlsteam.on('error', function (err) {
				install_logErrorOutput({
					logfile: logfile,
					logdata: err.message
				});
			});
			dlsteam.on('close', function () {
				install_logOutput({
					logfile: logfile,
					logdata: reponame + ' downloaded'
				});
				install_themePublicDir({
					logfile: logfile,
					themename: reponame.split('/')[1],
					cli: options.cli
				});
			});
		}
	});
};

var move_upload = function (options) {
	// console.log('options',options);
	var logfile = options.logfile,
		themename = options.themename;
	// fs.rename(returnFile.path,newfilepath,function(err){
	// });
	var decompress = new Decompress()
		.src(options.uploadedfile.path)
		.dest(options.themedir)
		.use(Decompress.zip());
	decompress.decompress(function (err
		//, files
	) {
		if (err) {
			install_logErrorOutput({
				logfile: logfile,
				logdata: err.message
			});
		}
		else {
			install_logOutput({
				logfile: logfile,
				logdata: 'unzipped directory'
			});
			fs.remove(options.uploadedfile.path, function (err
				//, filedir
			) {
				if (err) {
					install_logErrorOutput({
						logfile: logfile,
						logdata: err.message
					});
				}
				else {
					install_logOutput({
						logfile: logfile,
						logdata: 'removed zip file'
					});
					install_themePublicDir({
						logfile: logfile,
						themename: themename
					});
				}
			});
		}
	});
};

var upload_install = function (req, res) {
	var uploadedFile = CoreUtilities.removeEmptyObjectValues(req.controllerData.fileData),
		timestamp = (new Date()).getTime(),
		themename = path.basename(uploadedFile.filename, path.extname(uploadedFile.filename)),
		logdir = path.resolve(__dirname, '../../content/themes/log/'),
		logfile = path.join(logdir, 'install-theme.' + req.user._id + '.' + themename + '.' + timestamp + '.log'),
		themedir = path.join(process.cwd(), 'content/themes');

	install_logOutput({
		logfile: logfile,
		logdata: 'installing uploaded theme',
		callback: function (err) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					res: res,
					req: req,
					responseData: {
						result: 'success',
						data: {
							doc: {
								logfile: logfile,
								uploadedfile: uploadedFile,
								themename: themename,
								time: timestamp
							}
						}
					}
				});
				move_upload({
					themedir: themedir,
					themename: themename,
					uploadedfile: uploadedFile,
					logfile: logfile
				});
			}
		}
	});
};

var themeFunctions = {
	getlogfile: function (options) {
		return path.join(options.logdir, 'install-theme.' + options.userid + '.' + CoreUtilities.makeNiceName(options.reponame) + '.' + options.timestamp + '.log');
	},
	getrepourl: function (options) {
		return (options.repoversion === 'latest' || !options.repoversion) ?
			'https://github.com/' + options.reponame + '/archive/master.tar.gz' :
			'https://github.com/' + options.reponame + '/tarball/' + options.repoversion;
	},
	getlogdir: function () {
		return path.resolve(__dirname, '../../content/themes/log/');
	},
	getthemedir: function () {
		return path.join(process.cwd(), 'content/themes');
	}
};

/**
 * get both installed files, and the default files in ext conf directory, if missin files, add them to missing conf files array
 * @param {object} options ext_default_config_file_path - ext conf files,ext_installed_config_file_path - destination for ext conf files
 * @param  {Function} callback async.parallel callback
 * @return {Array}            array of missing conf files
 */
var getThemeConfigFiles = function (options, callback) {
	var ext_default_config_file_path = options.ext_default_config_file_path,
		ext_installed_config_file_path = options.ext_installed_config_file_path,
		missing_conf_files = [],
		installed_conf_files = [];

	async.parallel({
			defaultThemeConfFiles: function (cb) {
				fs.readdir(ext_default_config_file_path, function (err, files) {
					cb(null, files);
				});
			},
			installedThemeConfFiles: function (cb) {
				fs.readdir(ext_installed_config_file_path, function (err, files) {
					cb(null, files);
				});
			}
		},
		function (err, result) {
			try {
				if (result.defaultThemeConfFiles && result.defaultThemeConfFiles.length > 0) {
					missing_conf_files = result.defaultThemeConfFiles;
					if (result.installedThemeConfFiles && result.installedThemeConfFiles.length > 0) {
						for (var c in missing_conf_files) {
							for (var d in result.installedThemeConfFiles) {
								if (missing_conf_files[c] === result.installedThemeConfFiles[d]) {
									installed_conf_files.push(missing_conf_files.splice(c, 1)[0]);
								}
							}
						}
					}
				}
				callback(null, {
					ext_default_config_file_path: ext_default_config_file_path,
					ext_installed_config_file_path: ext_installed_config_file_path,
					missingThemeConfFiles: missing_conf_files
				});
			}
			catch (e) {
				callback(e, null);
			}
		});
};

/**
 * copy missing files if any are missing
 * @param {object} options ext_default_config_file_path - ext conf files,ext_installed_config_file_path - destination for ext conf files,missingThemeConfFiles array of missing files
 * @param  {Function} callback            async callback
 */
var copyMissingConfigFiles = function (options, callback) {
	var ext_default_config_file_path = options.ext_default_config_file_path,
		ext_installed_config_file_path = options.ext_installed_config_file_path,
		missingThemeConfFiles = options.missingThemeConfFiles;
	if (missingThemeConfFiles && missingThemeConfFiles.length > 0) {
		async.each(missingThemeConfFiles, function (file, cb) {
			fs.copy(path.resolve(ext_default_config_file_path, file), path.resolve(ext_installed_config_file_path, file), cb);
		}, function (err) {
			callback(err);
		});
	}
	else {
		callback(null);
	}
};

/**
 * copy extension config files if they don't exist
 * @param  {object}   options  configdir - default config files, extconfigdir - install directory of config files
 * @param  {Function} callback async callback
 * @return {Function}            async callback
 */
var installConfigDirectory = function (options, callback) {
	var defaultconfigdir = options.installedthemeconfdir,
		installextconfigdir = options.themeconfdestinationdir;

	if (defaultconfigdir && installextconfigdir) {

		fs.mkdirs(installextconfigdir, function (err) {
			if (err) {
				callback(err, null);
			}
			else {
				async.waterfall([
						function (cb) {
							cb(null, {
								ext_default_config_file_path: defaultconfigdir,
								ext_installed_config_file_path: installextconfigdir
							});
						},
						getThemeConfigFiles,
						copyMissingConfigFiles
					],
					function (err) {
						if (err) {
							callback(err, null);
						}
						else {
							callback(null, 'Copied config files');
						}
					}.bind(this));
			}
		}.bind(this));
	}
	else {
		callback(null, 'No config files to copy');
	}
};


var installpublicdir = function(asynccallback){
	var themedir = path.resolve(__dirname, '../../content/themes/', themename, 'public'),
		themepublicdir = path.resolve(__dirname, '../../public/themes/', themename);

	fs.readdir(themedir, function (err
		//, files
	) {
		// console.log('files',files);
		if (err) {
			asynccallback(null,'No Public Directory to Copy');
		}
		else {
			//make destination dir
			fs.mkdirs(themepublicdir, function (err) {
				if (err) {
					asynccallback(err,null);
				}
				else {
					fs.copy(themedir, themepublicdir, function (err) {
						if (err) {
							asynccallback(err,null);
						}
						else {
							asynccallback(null,'Copied public files');
						}
					});
				}
			});
		}
	});
};

var installdownload = function(asynccallback){
	var downloadtothemedir = path.join(themedir, reponame.split('/')[1]),
		Download = require('download'),
		themedownload;
	fs.ensureDir(downloadtothemedir, function (err) {
		if (err) {
			asynccallback(err,null);
		}
		else {
			themedownload = new Download({
				extract: true,
				strip: 1
			})
			.get(repourl)
			.dest(downloadtothemedir);

			themedownload.run(function(err,files,dlsteam){
				console.log('err',err,'files',files,'dlsteam',dlsteam);
				if(err){
					asynccallback(err,null);
				}
				else{
					themename = reponame.split('/')[1];
					asynccallback(err,reponame + ' downloaded -end');
/*
					dlsteam.on('response', function () {
						install_logOutput({
							logfile: logfile,
							logdata: reponame + ' starting download'
						});
					});
					dlsteam.on('data', function () {
						install_logOutput({
							logfile: logfile,
							logdata: 'downloading data'
						});
						logger.info('downloading data');
					});
					dlsteam.on('error', function (err) {
						install_logErrorOutput({
							logfile: logfile,
							logdata: err.message
						});
					});
					dlsteam.on('close', function () {
						themename = reponame.split('/')[1];
						asynccallback(err,reponame + ' downloaded -close');
					});
					dlsteam.on('end', function () {
						themename = reponame.split('/')[1];
						asynccallback(err,reponame + ' downloaded -end');
					});
*/
				}
			});	
		}		
	});
};

var setupinstalllog = function(options,asynccallback){
	install_logOutput({
		logfile: logfile,
		logdata: 'beginning theme install: ' + reponame,
		callback: function (err) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: options.res,
					req: options.req
				});
				asynccallback(err,null);
			}
			else {
				CoreController.handleDocumentQueryRender({
					res: options.res,
					req: options.req,
					responseData: {
						result: 'success',
						data: {
							url: repourl,
							repo: CoreUtilities.makeNiceName(reponame),
							time: timestamp
						}
					}
				});
				asynccallback(null,'setup theme install log file');
			}
		}
	});
};

var installThemeFromGithub = function(options){
	async.series({
			installlog: function(asynccallback){
				setupinstalllog({
					res:options.res,
					req: options.req
				},asynccallback);
			},
			downlaod: installdownload,
			publicdir: installpublicdir,
			configdir: function(asynccallback){
				var themedir = path.resolve(__dirname, '../../content/themes/', themename, 'public'),
				themepublicdir = path.resolve(__dirname, '../../public/themes/', themename);
				installConfigDirectory({
					installedthemeconfdir: path.resolve(process.cwd(), 'content/themes/', themename,'config'),
					themeconfdestinationdir: path.resolve(process.cwd(), 'content/config/themes/', themename)
				},asynccallback);
			}
		},
		function(err,results){
			if (err) {
				install_logErrorOutput({
					logfile: logfile,
					logdata: err.message,
					cli: clitask
				});
			}
			else{
				console.log('install theme results',results);
				install_logOutput({
					logfile: logfile,
					logdata: themename +' \r\n '+ JSON.stringify(results,null,2) + ' \r\n installed, application restarting \r\n  ====##END##====',
					callback: function () {}
				});
				if (clitask) {
					logger.info(themename + ' \r\n '+ JSON.stringify(results,null,2) + ' \r\n installed \r\n  ====##END##====');
					remove_clilog({
						logfile: logfile,
						themename: themename
					});
					process.exit(0);
				}
			}
	});
};

var install = function (req, res) {
	repoversion = req.query.version;
	reponame = req.query.name;
	repourl = themeFunctions.getrepourl({
		repoversion: repoversion,
		reponame: reponame
	});
	timestamp = (new Date()).getTime();
	logdir = themeFunctions.getlogdir();
	logfile = themeFunctions.getlogfile({
		logdir: logdir,
		userid: req.user._id,
		reponame: reponame,
		timestamp: timestamp
	});
	themedir = themeFunctions.getthemedir();
	clitask = false;

	installThemeFromGithub({
		res: res,
		req: req
	});
};

var cli = function (argv) {
	//node index.js --cli --controller theme --install true --name 'typesettin/periodicjs.theme.minimal' --version latest

	if (argv.install) {
		console.log('installing via cli', argv);
		var repoversion = argv.version,
			reponame = argv.name,
			repourl = themeFunctions.getrepourl({
				repoversion: repoversion,
				reponame: reponame
			}),
			timestamp = (new Date()).getTime(),
			logdir = themeFunctions.getlogdir(),
			logfile = themeFunctions.getlogfile({
				logdir: logdir,
				userid: 'cli',
				reponame: reponame,
				timestamp: timestamp
			}),
			themedir = themeFunctions.getthemedir();

		install_logOutput({
			logfile: logfile,
			logdata: 'beginning theme install: ' + reponame,
			callback: function (err) {
				if (err) {
					throw new Error(err);
				}
				else {
					install_viaDownload({
						themedir: themedir,
						repourl: repourl,
						logfile: logfile,
						reponame: reponame,
						cli: true
					});
				}
			}
		});
	}
	else {
		console.log(argv);
		console.log(themeFunctions.getlogfile(argv));
		process.exit(0);
	}
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);


	return {
		customLayout: customLayout,
		enable: enable,
		remove: remove,
		remove_getOutputLog: remove_getOutputLog,
		cleanup_log: cleanup_log,
		install: install,
		upload_install: upload_install,
		install_getOutputLog: install_getOutputLog,
		upload_getOutputLog: upload_getOutputLog,
		cli: cli
	};
};

module.exports = controller;
