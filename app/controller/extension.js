'use strict';

var path = require('path'),
		fs = require('fs-extra'),
		npm = require("npm"),
		semver = require("semver"),
		async = require("async"),
		appController = require('./application'),
		Extensions = require('../lib/extensions'),
		Decompress = require('decompress'),
		applicationController,
		appSettings,
		mongoose,
		logger;

var updateRunningExtensions  = function(options){
	if(appSettings.extconf){
		appSettings.extconf.extensions = options.extensions;
	}
};
var getCurrentExt = function(options){
	var extname = options.extname,
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

	return {selectedExt:selectedExt,numX:z};
};

var install_logErrorOutput = function(options){
	var logfile = options.logfile,
			logdata = options.logdata+'\r\n ';
	logger.error(logdata);
	fs.appendFile(logfile,logdata+'====!!ERROR!!====',function(err){
		if(err){
			logger.error(err);
		}
		if(options.cli){
			process.exit(0);
		}
	});
};

var remove_clilog = function(options){
	fs.remove(options.logfile, function(err){
		if(err){
			install_logErrorOutput({
				logfile : options.logfile,
				logdata : err.message,
				cli: options.cli
			});
		}
		else{
			logger.info(options.extname+' log removed \r\n  ====##END##====');
		}
	});
};

var install_logOutput = function(options){
	var logfile = options.logfile,
		logdata = options.logdata+'\r\n',
		callback = options.callback;

	fs.appendFile(logfile,logdata,function(err){
		if(err){
			logger.error(err);
			callback(err);
			//try and write message to end console
			install_logErrorOutput({
				logfile : logfile,
				logdata : err.message
			});
		}
		else{
			if(callback){
				callback(null);
			}
		}
	});
};

var install_updateExtConfFile = function(options){
	var currentExtConfSettings = {},
		currentExtensions = options.currentExtensions,
		logfile = options.logfile,
		extToAdd = options.extToAdd;
	currentExtConfSettings.extensions = [];
		// console.log('------------','extension to add',extToAdd);

	if(!extToAdd.name){
		install_logErrorOutput({
			logfile : logfile,
			logdata : "extension conf doesn't have a valid name",
			cli : options.cli
		});
	}
	else if(!semver.valid(extToAdd.version)){
		install_logErrorOutput({
			logfile : logfile,
			logdata : "extension conf doesn't have a valid semver",
			cli : options.cli
		});
	}
	else if(!semver.valid(extToAdd.periodicConfig.periodicCompatibility)){
		install_logErrorOutput({
			logfile : logfile,
			logdata : "extension conf doesn't have a valid periodic semver",
			cli : options.cli
		});
	}
	else{
		var alreadyInConf = false, extIndex;
		for(var x in currentExtensions){
			if(currentExtensions[x].name === extToAdd.name){
				alreadyInConf=true;
				extIndex=x;
			}
		}
		if(alreadyInConf){
			currentExtensions[x]=extToAdd;
		}
		else{
			currentExtensions.push(extToAdd);
		}
		currentExtConfSettings.extensions = currentExtensions;

		fs.outputJson(Extensions.getExtensionConfFilePath, currentExtConfSettings, function(err){
			if(err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message,
					cli : options.cli
				});
			}
			else{
				//updated running extensions:
				updateRunningExtensions({extensions:currentExtConfSettings.extensions});
				install_logOutput({
					logfile : logfile,
					logdata : extToAdd.name+' installed, extensions.conf updated, application restarting \r\n  ====##END##====',
					callback : function(err){
					}
				});
				if(options.cli){
					logger.info(extToAdd.name+' installed, extensions.conf updated \r\n  ====##END##====');
					remove_clilog({logfile:logfile,extname:extToAdd.name});
					process.exit(0);
				}
			}
		});
		// console.log('------------',Extensions.getExtensionConfFilePath,'------------','updated ext currentExtConfSettings',currentExtConfSettings);
	}
};

var install_updateExtConf = function(options){
	var logfile = options.logfile,
		extname = options.extname,
		extpackfile = Extensions.getExtensionPackageJsonFilePath(extname),
		extconffile = Extensions.getExtensionPeriodicConfFilePath(extname),
		extpackfileJSON = {},
		currentExtensionsConf;

	// console.log("cli",options.cli);

	applicationController.loadExtensions({
		periodicsettings:appSettings,
		callback:function(err,extensions){
			if(err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message,
					cli : options.cli
				});
			}
			else{
				currentExtensionsConf = extensions;
				// console.log('currentExtensionsConf',currentExtensionsConf);
				async.parallel({
					packfile:function(callback){
						Extensions.readJSONFileAsync(extpackfile,callback);
					},
					conffile:function(callback){
						Extensions.readJSONFileAsync(extconffile,callback);
					}
				},function(err,results){
					if(err){
						install_logErrorOutput({
							logfile : logfile,
							logdata : err.message,
							cli : options.cli
						});
					}
					else{
						extpackfileJSON = {
							"name":results.packfile.name,
							"version":results.packfile.version,
							"periodicCompatibility":results.conffile.periodicCompatibility,
							"installed":true,
							"enabled":false,
							"periodicConfig":results.conffile
						};

						install_updateExtConfFile({
							currentExtensions : currentExtensionsConf,
							extToAdd : extpackfileJSON,
							logfile : logfile,
							cli : options.cli
						});
					}
				});
			}
		}
	});
};

var install_extPublicDir = function(options){
	var logfile = options.logfile,
			extname = options.extname,
      extdir= path.resolve(__dirname,'../../content/extensions/node_modules/',extname,'public'),
      extpublicdir= path.resolve(__dirname,'../../public/extensions/',extname);
		// console.log("extname",extname);
	fs.readdir(extdir,function(err,files){
		// console.log("files",files);
		if(err){
			install_logOutput({
				logfile : logfile,
				logdata : 'No Public Directory to Copy',
				callback : function(err){
					install_updateExtConf({
						logfile : options.logfile,
						extname : options.extname,
						cli : options.cli
					});
				}
			});
		}
		else{
			//make destination dir
			fs.mkdirs(extpublicdir, function(err){
				if (err) {
					install_logErrorOutput({
						logfile : logfile,
						logdata : err.message,
						cli : options.cli
					});
				}
				else{
					fs.copy(extdir,extpublicdir,function(err){
						if (err) {
							install_logErrorOutput({
								logfile : logfile,
								logdata : err.message,
								cli : options.cli
							});
						}
						else{
							install_logOutput({
								logfile : logfile,
								logdata : 'Copied public files',
								callback : function(err){
									install_updateExtConf({
										logfile : options.logfile,
										extname : options.extname,
										cli : options.cli
									});
								}
							});
						}
					});
				}
			});
		}
	});
};

var install_viaNPM = function(options){
	var extdir = options.extdir,
			cli = options.cli,
			repourl = options.repourl,
			reponame = options.reponame,
			logfile = options.logfile;
	npm.load({
			"strict-ssl" : false,
			"production" : true,
			prefix:extdir
		},
		function (err) {
			if (err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message,
					cli : cli
				});
			}
			else{
				npm.commands.install([repourl], function (err, data) {
					if (err) {
						install_logErrorOutput({
							logfile : logfile,
							logdata : err.message,
							cli : cli
						});
					}
					else{
						install_logOutput({
							logfile : logfile,
							logdata : data,
							callback : function(err){
								if (!err) {
									install_extPublicDir({
										logfile : logfile,
										extname: reponame.split('/')[1],
										cli : cli
									});
								}
							}
						});
					}
					// command succeeded, and data might have some info
				});
				npm.on("log", function (message) {
					install_logOutput({
						logfile : logfile,
						logdata : message,
						cli : cli,
						callback : function(err){
						}
					});
				});
			}
	});
};

var upload_npminstall = function(options){
	var extdir = options.extdir,
			logfile = options.logfile,
			extname = options.extname;
	npm.load({
			"strict-ssl" : false,
			"production" : true,
			prefix : path.join(extdir,extname)
		},
		function (err) {
			if (err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message
				});
			}
			else{
				npm.commands.install( function (err, data) {
					if (err) {
						install_logErrorOutput({
							logfile : logfile,
							logdata : err.message
						});
					}
					else{
						install_logOutput({
							logfile : logfile,
							logdata : data,
							callback : function(err){
								if (!err) {
									install_extPublicDir({
										logfile : logfile,
										extname: extname
									});
								}
							}
						});
					}
					// command succeeded, and data might have some info
				});
				npm.on("log", function (message) {
					install_logOutput({
						logfile : logfile,
						logdata : message,
						callback : function(err){
						}
					});
				});
			}
	});
};

var move_upload = function(options){
	// console.log("options",options);
	var logfile = options.logfile,
			extname = options.extname,
			extdir = options.extdir;
	// fs.rename(returnFile.path,newfilepath,function(err){
	// });
	var decompress = new Decompress()
    .src(options.uploadedfile.path)
    .dest(extdir)
    .use(Decompress.zip());
  decompress.decompress(function(err,files){
		if(err){
			install_logErrorOutput({
				logfile : logfile,
				logdata : err.message
			});
		}
		else{
			install_logOutput({
				logfile : logfile,
				logdata : 'unzipped directory'
			});
			fs.remove(options.uploadedfile.path,function(err,filedir){
				if(err){
					install_logErrorOutput({
						logfile : logfile,
						logdata : err.message
					});
				}
				else{
					install_logOutput({
						logfile : logfile,
						logdata : 'removed zip file'
					});
					upload_npminstall({
						extdir : extdir,
						logfile : logfile,
						extname : extname
					});
				}
			});
		}
  });
};

var extFunctions = {
	getlogfile : function(options){
		return path.join(options.logdir,'install-ext.'+options.userid+'.'+ applicationController.makeNiceName(options.reponame) +'.'+options.timestamp+'.log');
	},
	getrepourl : function(options){
		return (options.repoversion==='latest' || !options.repoversion) ?
            'https://github.com/'+options.reponame+'/archive/master.tar.gz' :
            'https://github.com/'+options.reponame+'/tarball/'+options.repoversion;
	},
	getlogdir : function(options){
		return path.resolve(__dirname,'../../content/extensions/log/');
	},
	getextdir : function(options){
		return path.join(process.cwd(),'content/extensions/node_modules');
	}
};

var install = function(req, res, next){
  var repoversion = req.query.version,
      reponame = req.query.name,
			repourl = extFunctions.getrepourl({
				repoversion:repoversion,
				reponame:reponame
			}),
      timestamp = (new Date()).getTime(),
			logdir = extFunctions.getlogdir(),
			logfile = extFunctions.getlogfile({
				logdir:logdir,
				userid:req.user._id,
				reponame:reponame,
				timestamp:timestamp
			}),
			extdir = extFunctions.getextdir();
	//JSON.stringify(myData, null, 4)
	install_logOutput({
			logfile : logfile,
			logdata : "beginning extension install: "+reponame,
			callback : function(err) {
				if(err) {
					applicationController.handleDocumentQueryErrorResponse({
						err:err,
						res:res,
						req:req
					});
				}
				else {
					applicationController.handleDocumentQueryRender({
						res:res,
						req:req,
						responseData:{
							result:"success",
							data:{
								url:repourl,
								repo:applicationController.makeNiceName(reponame),
								time:timestamp
							}
						}
					});
					install_viaNPM({
						extdir : extdir,
						repourl : repourl,
						logfile : logfile,
						reponame : reponame
					});
				}
		}
	});
};

var cli = function(argv){
	//node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest
	if(argv.install){
		var repoversion = argv.version,
				reponame = argv.name,
				repourl = extFunctions.getrepourl({
					repoversion:repoversion,
					reponame:reponame
				}),
				timestamp = (new Date()).getTime(),
				logdir = extFunctions.getlogdir(),
				logfile = extFunctions.getlogfile({
					logdir:logdir,
					userid:'cli',
					reponame:reponame,
					timestamp:timestamp
				}),
				extdir = extFunctions.getextdir();

		install_logOutput({
			logfile : logfile,
			logdata : "beginning extension install: "+reponame,
			callback : function(err) {
				if(err) {
					throw new Error(err);
				}
				else {
					install_viaNPM({
						extdir : extdir,
						repourl : repourl,
						logfile : logfile,
						reponame : reponame,
						cli : true
					});
				}
			}
		});
	}
	else{
		console.log(argv);
		console.log(extFunctions.getlogfile(argv));
		process.exit(0);
	}
};
var upload_install = function(req, res, next){
	var uploadedFile = applicationController.removeEmptyObjectValues(req.controllerData.fileData),
      timestamp = (new Date()).getTime(),
			extname = path.basename(uploadedFile.filename,path.extname(uploadedFile.filename)),
      logdir= path.resolve(__dirname,'../../content/extensions/log/'),
			logfile = path.join(logdir,'install-ext.'+req.user._id+'.'+ extname +'.'+timestamp+'.log'),
			extdir = path.join(process.cwd(),'content/extensions/node_modules');

	install_logOutput({
			logfile : logfile,
			logdata : "beginning extension install: "+extname,
			callback : function(err) {
				if(err) {
					applicationController.handleDocumentQueryErrorResponse({
						err:err,
						res:res,
						req:req
					});
				}
				else {
					applicationController.handleDocumentQueryRender({
						res:res,
						req:req,
						responseData:{
							result:"success",
							data:{
								doc:{
									logfile:logfile,
									uploadedfile:uploadedFile,
									extname:extname,
									time:timestamp
								}
							}
						}
					});
					move_upload({
						extdir : extdir,
						extname : extname,
						uploadedfile : uploadedFile,
						logfile : logfile
					});
				}
		}
	});
};

var install_removeExtFromConf = function(options){
	var extname = options.extname,
		selectedExtObj = getCurrentExt({extname:extname}),
		selectedExt = selectedExtObj.selectedExt,
		numX = selectedExtObj.numX,
		logfile = options.logfile;

	appSettings.extconf.extensions.splice(numX, 1);
	fs.outputJson(
		Extensions.getExtensionConfFilePath,
		appSettings.extconf,
		function(err){
			if(err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message
				});
			}
			else{
				install_logOutput({
					logfile : logfile,
					logdata : extname+' removed, extensions.conf updated, application restarting \r\n  ====##REMOVED-END##====',
					callback : function(err){
					}
				});
				applicationController.restart_app();
			}
		}
	);
};

var uninstall_viaNPM = function(options){
	var extdir = options.extdir,
		repourl = options.repourl,
		extname = options.extname,
		logfile = options.logfile;
	npm.load({
			"strict-ssl" : false,
			"production" : true,
			prefix:extdir
		},
		function (err) {
			if (err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message
				});
			}
			else{
				npm.commands.uninstall([extname], function (err, data) {
					if (err) {
						install_logErrorOutput({
							logfile : logfile,
							logdata : err.message
						});
					}
					else{
						install_logOutput({
							logfile : logfile,
							logdata : data,
							callback : function(err){
								if (!err) {
									install_removeExtFromConf({
										logfile : logfile,
										extname: extname
									});
								}
							}
						});
						fs.remove(path.resolve(__dirname,'../../public/extensions/',extname), function(err){
							if (err){
								logger.error(err);
							}
							else{
								logger.info("removed extension public dir files");
							}
						});

					}
					// command succeeded, and data might have some info
				});
				npm.on("log", function (message) {
					install_logOutput({
						logfile : logfile,
						logdata : message,
						callback : function(err){
						}
					});
				});
			}
	});
};

var cleanup_log = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/extensions/log/'),
		logfile=path.join(logdir,req.query.mode+'-ext.'+req.user._id+'.'+applicationController.makeNiceName(req.params.extension)+'.'+req.params.date+'.log');

	fs.remove(logfile, function(err){
		if (err){
			applicationController.handleDocumentQueryErrorResponse({
				err:err,
				res:res,
				req:req
			});
		}
		else{
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				responseData:{
					result:"success",
					data:{
						msg:"removed log file"
					}
				}
			});
		}
	});
};

var remove = function(req, res, next){
    var extname = req.params.id,
        timestamp = (new Date()).getTime(),
        logdir= path.resolve(__dirname,'../../content/extensions/log/'),
		logfile=path.join(logdir,'remove-ext.'+req.user._id+'.'+ applicationController.makeNiceName(extname) +'.'+timestamp+'.log'),
		myData = {
			result:"start",
			data:{
				message:"beginning extension removal: "+extname,
				time:timestamp
			}
		},
		extdir = path.join(process.cwd(),'content/extensions/node_modules');
	//JSON.stringify(myData, null, 4)
	//JSON.stringify(myData, null, 4)
	install_logOutput({
			logfile : logfile,
			logdata : myData.data.message,
			callback : function(err) {
				if(err) {
					applicationController.handleDocumentQueryErrorResponse({
						err:err,
						res:res,
						req:req
					});
				}
				else {
					applicationController.handleDocumentQueryRender({
						res:res,
						req:req,
						responseData:{
							result:"success",
							data:{
								repo:applicationController.makeNiceName(extname),
								extname:extname,
								time:timestamp
							}
						}
					});
					uninstall_viaNPM({
						extdir : extdir,
						logfile : logfile,
						extname : extname
					});
				}
		}
	});
};

var remove_getOutputLog = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/extensions/log/'),
		logfile=path.join(logdir,'remove-ext.'+req.user._id+'.'+applicationController.makeNiceName(req.params.extension)+'.'+req.params.date+'.log'),
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

var install_getOutputLog = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/extensions/log/'),
		logfile=path.join(logdir,'install-ext.'+req.user._id+'.'+applicationController.makeNiceName(req.params.extension)+'.'+req.params.date+'.log'),
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

var upload_getOutputLog = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/extensions/log/'),
		logfile=path.join(logdir,'install-ext.'+req.user._id+'.'+req.params.extension+'.'+req.params.date+'.log'),
		stat = fs.statSync(logfile),
		readStream = fs.createReadStream(logfile);

    res.writeHead(200, {
        'Content-Type': ' text/plain',
        'Content-Length': stat.size
    });

    readStream.pipe(res);
};

var disable = function(req,res,next){
	var extname = req.params.id,
		selectedExtObj = {selectedExt:req.controllerData.extension,numX:req.controllerData.extensionx},
		selectedExt = selectedExtObj.selectedExt,
		numX = selectedExtObj.numX;

	appSettings.extconf.extensions[numX].enabled = false;
	fs.outputJson(
		Extensions.getExtensionConfFilePath,
		appSettings.extconf,
		function(err){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req,
					redirecturl:'/p-admin/extensions'
				});
			}
			else{
				applicationController.handleDocumentQueryRender({
					req:req,
					res:res,
					redirecturl:'/p-admin/extensions',
					responseData:{
						result:"success",
						data:{
							ext:extname,
							msg:'extension disabled'
						}
					}
				});
				applicationController.restart_app();
			}
		}
	);
};

var enable = function(req,res,next){
	var extname = req.params.id,
		selectedExtObj = {selectedExt:req.controllerData.extension,numX:req.controllerData.extensionx},
		selectedExt = selectedExtObj.selectedExt,
		numX = selectedExtObj.numX,
		selectedExtDeps = selectedExt.periodicConfig.periodicDependencies,
		numSelectedExtDeps = selectedExtDeps.length,
		confirmedDeps = [];

	selectedExt.enabled = true;
	appSettings.extconf.extensions = req.controllerData.extensions;

	try{
		if(!semver.lte(
			selectedExt.periodicCompatibility,appSettings.version)
			){
			applicationController.handleDocumentQueryErrorResponse({
				err:new Error('This extension requires periodic version: '+selectedExt.periodicCompatibility+' not: '+appSettings.version),
				res:res,
				req:req
			});
		}
		else{
			// console.log("selectedExtDeps",selectedExtDeps);
			for(var x in selectedExtDeps){
				var checkDep = selectedExtDeps[x];
				// console.log("checking x: "+x,checkDep);

				for(var y in appSettings.extconf.extensions){
					var checkExt = appSettings.extconf.extensions[y];
					// console.log("checking y: "+y,checkExt);

					if( checkDep.extname === checkExt.name && checkExt.enabled ){
						confirmedDeps.push(checkExt.name);
					}
				}
			}
			// console.log("confirmedDeps",confirmedDeps);
			// console.log("numSelectedExtDeps",numSelectedExtDeps);

			if(numSelectedExtDeps === confirmedDeps.length){
				// console.log("confirmedDeps",confirmedDeps);
				// console.log("confirmedDeps",confirmedDeps);
				// console.log("appSettings.extconf",appSettings.extconf);
				appSettings.extconf.extensions[numX].enabled = true;

				fs.outputJson(
					Extensions.getExtensionConfFilePath,
					appSettings.extconf,
					function(err){
						if(err){
							applicationController.handleDocumentQueryErrorResponse({
								err:err,
								res:res,
								req:req,
								redirecturl:'/p-admin/extensions'
							});
						}
						else{
							applicationController.handleDocumentQueryRender({
								req:req,
								res:res,
								redirecturl:'/p-admin/extensions',
								responseData:{
									result:"success",
									data:{
										ext:extname,
										msg:'extension enabled'
									}
								}
							});
							applicationController.restart_app();
						}
					}
				);
			}
			else{
				applicationController.handleDocumentQueryErrorResponse({
					err:new Error('Missing '+(numSelectedExtDeps-confirmedDeps.length)+' enabled extensions.'),
					res:res,
					req:req,
					redirecturl:'/p-admin/extensions'
				});
			}
		}
	}
	catch(e){
		applicationController.handleDocumentQueryErrorResponse({
			err:e,
			res:res,
			req:req
		});
	}
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		install:install,
		install_getOutputLog:install_getOutputLog,
		remove_getOutputLog:remove_getOutputLog,
		cleanup_log:cleanup_log,
		remove:remove,
		disable:disable,
		enable:enable,
		upload_install:upload_install,
		upload_getOutputLog:upload_getOutputLog,
		cli:cli
	};
};

module.exports = controller;