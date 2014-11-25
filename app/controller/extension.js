'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	npm = require('npm'),
	// appController = require('./application'),
	Extensions = require('periodicjs.core.extensions'),
	Utilities = require('periodicjs.core.utilities'),
	CoreExtension,
	CoreUtilities,
	CoreControllerHelper = require('periodicjs.core.controller'),
	Decompress = require('decompress'),
	// applicationController,
	CoreController,
	extFunctions,
	appSettings,
	mongoose,
	logger,
	restartfile = path.join(process.cwd(), '/content/config/restart.json');

var install_logErrorOutput = function (options) {
	var logfile = options.logfile,
		logdata = options.logdata + '\r\n ';
	logger.error(logdata);
	fs.appendFile(logfile, logdata + '====!!ERROR!!====', function (err) {
		if (err) {
			logger.error(err);
		}
		if (options.cli) {
			process.exit(0);
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
			callback(err);
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

var install_viaNPM = function (options) {
	var cli = options.cli,
		repourl = options.repourl,
		reponame = options.reponame,
		logfile = options.logfile;
	npm.load({
			'strict-ssl': false,
			'save-optional': true,
			'production': true
		},
		function (err) {
			if (err) {
				install_logErrorOutput({
					logfile: logfile,
					logdata: err.message,
					cli: cli
				});
			}
			else {
				npm['save-optional']=true;
				npm.commands.install([repourl], function (err, data) {
					if (err) {
						install_logErrorOutput({
							logfile: logfile,
							logdata: err.message,
							cli: cli
						});
					}
					else {
						install_logOutput({
							logfile: logfile,
							logdata: data,
							callback: function (err) {
								if (!err) {
									var extToAddname = reponame.split('/')[1];
									install_logOutput({
										logfile: logfile,
										logdata: extToAddname + ' installed, extensions.conf updated, application restarting \r\n  ====##END##====',
										callback: function () {
											CoreUtilities.restart_app({
												restartfile: restartfile
											});
										}
									});
								}
							}
						});
					}
					// command succeeded, and data might have some info
				});
				npm.on('log', function (message) {
					install_logOutput({
						logfile: logfile,
						logdata: message,
						cli: cli,
						callback: function () {}
					});
				});
			}
		});
};

var upload_npminstall = function (options) {
	var extdir = options.extdir,
		logfile = options.logfile,
		extname = options.extname;
	npm.load({
			'strict-ssl': false,
			'production': true,
			'save-optional': true,
			prefix: path.join(extdir, extname)
		},
		function (err) {
			if (err) {
				install_logErrorOutput({
					logfile: logfile,
					logdata: err.message
				});
			}
			else {
				npm['save-optional']=true;
				npm.commands.install(function (err, data) {
					if (err) {
						install_logErrorOutput({
							logfile: logfile,
							logdata: err.message
						});
					}
					else {
						install_logOutput({
							logfile: logfile,
							logdata: data,
							callback: function (err) {
								if (!err) {
									install_logOutput({
										logfile: logfile,
										logdata: extname + ' installed, extensions.conf updated, application restarting \r\n  ====##END##====',
										callback: function () {
											CoreUtilities.restart_app({
												restartfile: restartfile
											});
										}
									});
								}
							}
						});
					}
					// command succeeded, and data might have some info
				});
				npm.on('log', function (message) {
					install_logOutput({
						logfile: logfile,
						logdata: message,
						callback: function () {}
					});
				});
			}
		});
};

var move_upload = function (options) {
	var logfile = options.logfile,
		extname = options.extname,
		extdir = options.extdir;
	var decompress = new Decompress()
		.src(options.uploadedfile.path)
		.dest(extdir)
		.use(Decompress.zip());
	decompress.decompress(function (err, files) {
		if (err) {
			install_logErrorOutput({
				logfile: logfile,
				logdata: err.message
			});
		}
		else {
			logger.silly('files', files);
			install_logOutput({
				logfile: logfile,
				logdata: 'unzipped directory'
			});
			fs.remove(options.uploadedfile.path, function (err, filedir) {
				if (err) {
					install_logErrorOutput({
						logfile: logfile,
						logdata: err.message
					});
				}
				else {
					logger.silly('filedir', filedir);
					install_logOutput({
						logfile: logfile,
						logdata: 'removed zip file'
					});
					upload_npminstall({
						extdir: extdir,
						logfile: logfile,
						extname: extname
					});
				}
			});
		}
	});
};

var install = function (req, res) {
	var repoversion = req.query.version,
		reponame = req.query.name,
		repourl = extFunctions.getrepourl({
			repoversion: repoversion,
			reponame: reponame
		}),
		timestamp = (new Date()).getTime(),
		logdir = extFunctions.getlogdir(),
		logfile = extFunctions.getlogfile({
			logdir: logdir,
			userid: req.user._id,
			reponame: reponame,
			timestamp: timestamp
		}),
		extdir = extFunctions.getextdir();
	//JSON.stringify(myData, null, 4)
	install_logOutput({
		logfile: logfile,
		logdata: 'beginning extension install: ' + reponame,
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
							url: repourl,
							repo: CoreUtilities.makeNiceName(reponame),
							time: timestamp
						}
					}
				});
				install_viaNPM({
					extdir: extdir,
					repourl: repourl,
					logfile: logfile,
					reponame: reponame
				});
			}
		}
	});
};

var cli = function (argv) {
	//node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest
	if (argv.install) {
		var repoversion = argv.version,
			reponame = argv.name,
			repourl = extFunctions.getrepourl({
				repoversion: repoversion,
				reponame: reponame
			}),
			timestamp = (new Date()).getTime(),
			logdir = extFunctions.getlogdir(),
			logfile = extFunctions.getlogfile({
				logdir: logdir,
				userid: 'cli',
				reponame: reponame,
				timestamp: timestamp
			}),
			extdir = extFunctions.getextdir();

		install_logOutput({
			logfile: logfile,
			logdata: 'beginning extension install: ' + reponame,
			callback: function (err) {
				if (err) {
					throw new Error(err);
				}
				else {
					install_viaNPM({
						extdir: extdir,
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
		console.log(extFunctions.getlogfile(argv));
		process.exit(0);
	}
};
var upload_install = function (req, res) {
	var uploadedFile = CoreUtilities.removeEmptyObjectValues(req.controllerData.fileData),
		timestamp = (new Date()).getTime(),
		extname = path.basename(uploadedFile.filename, path.extname(uploadedFile.filename)),
		logdir = path.resolve(__dirname, '../../content/config/log/'),
		logfile = path.join(logdir, 'install-ext.' + req.user._id + '.' + extname + '.' + timestamp + '.log'),
		extdir = path.join(process.cwd(), 'content/extensions/node_modules');

	install_logOutput({
		logfile: logfile,
		logdata: 'beginning extension install: ' + extname,
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
								extname: extname,
								time: timestamp
							}
						}
					}
				});
				move_upload({
					extdir: extdir,
					extname: extname,
					uploadedfile: uploadedFile,
					logfile: logfile
				});
			}
		}
	});
};

var cleanup_log = function (req, res) {
	var logdir = path.resolve(__dirname, '../../content/config/log/'),
		logfile = path.join(logdir, req.query.mode + '-ext.' + req.user._id + '.' + CoreUtilities.makeNiceName(req.params.extension) + '.' + req.params.date + '.log');

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

var getOutputLog = function (options) {
	var res = options.res,
		req = options.req,
		extlogname = options.extlogname,
		logprefix = options.logprefix,
		logdir = path.resolve(__dirname, '../../content/config/log/'),
		logfile = path.join(logdir, logprefix + req.user._id + '.' + extlogname + '.' + req.params.date + '.log'),
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

var remove_getOutputLog = function (req, res) {
	getOutputLog({
		res: res,
		req: req,
		extlogname: CoreUtilities.makeNiceName(req.params.extension),
		logprefix: 'remove-ext.'
	});
};

var install_getOutputLog = function (req, res) {
	getOutputLog({
		res: res,
		req: req,
		extlogname: CoreUtilities.makeNiceName(req.params.extension),
		logprefix: 'install-ext.'
	});
};

var upload_getOutputLog = function (req, res) {
	getOutputLog({
		res: res,
		req: req,
		extlogname: req.params.extension,
		logprefix: 'install-ext.'
	});
};

var remove = function (req, res) {
	var extname = req.params.id,
		extfilename = CoreUtilities.makeNiceName(extname),
		timestamp = (new Date()).getTime(),
		logdir = path.resolve(process.cwd(), 'content/config/log/'),
		logfile = extFunctions.getlogfile({
			logdir: logdir,
			installprefix: 'remove-ext.',
			userid: req.user._id,
			extfilename: extfilename,
			timestamp: timestamp
		});

	install_logOutput({
		logfile: logfile,
		logdata: 'beginning extension removal: ' + extname,
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
							repo: CoreUtilities.makeNiceName(extname),
							extname: extname,
							time: timestamp
						}
					}
				});
				CoreExtension.uninstall_viaNPM({
					extname: extname
				}, function (err, data) {
					if (err) {
						install_logErrorOutput({
							logfile: logfile,
							logdata: err.message
						});
					}
					else {
						install_logOutput({
							logfile: logfile,
							logdata: extname + ' removed, extensions.conf updated, application restarting \r\n  ====##REMOVED-END##====',
							callback: function () {
								logger.silly(data);
							}
						});
						CoreUtilities.restart_app({
							restartfile: restartfile
						});
					}
				});
			}
		}
	});
};

var disable = function (req, res) {
	var extname = req.params.id;
	CoreExtension.disableExtension({
			extension: req.controllerData.extension,
			extensionx: req.controllerData.extensionx,
			appSettings: appSettings
		},
		function (err, status) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req,
					redirecturl: '/p-admin/extensions'
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/extensions',
					responseData: {
						result: 'success',
						data: {
							ext: extname,
							msg: status
						}
					}
				});
				CoreUtilities.restart_app({
					restartfile: restartfile
				});
			}
		});
};

var enable = function (req, res) {
	var extname = req.params.id;

	CoreExtension.enableExtension({
			extension: req.controllerData.extension,
			extensionx: req.controllerData.extensionx,
			appSettings: appSettings,
			extensions: req.controllerData.extensions
		},
		function (err, status) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req,
					redirecturl: '/p-admin/extensions'
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/extensions',
					responseData: {
						result: 'success',
						data: {
							ext: extname,
							msg: status
						}
					}
				});
				CoreUtilities.restart_app({
					restartfile: restartfile
				});
			}
		});
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	// applicationController = new appController(resources);
	CoreController = new CoreControllerHelper(resources);
	CoreExtension = new Extensions(appSettings);
	CoreUtilities = new Utilities(resources);
	extFunctions = CoreExtension.extFunctions();

	return {
		install: install,
		install_getOutputLog: install_getOutputLog,
		cleanup_log: cleanup_log,
		enable: enable,
		upload_install: upload_install,
		upload_getOutputLog: upload_getOutputLog,
		remove: remove,
		remove_getOutputLog: remove_getOutputLog,
		disable: disable,
		cli: cli
	};
};

module.exports = controller;
