'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	npm = require("npm"),
	semver = require("semver"),
	async = require("async"),
	appController = require('./application'),
	Extensions = require('../lib/extensions'),
	applicationController,
	appSettings,
	mongoose,
	logger;

var install_logErrorOutput = function(options){
	var logfile = options.logfile,
		logdata = options.logdata+'\r\n ';
	logger.error(logdata);
	fs.appendFile(logfile,logdata+'====!!ERROR!!====',function(err){
		if(err){
			logger.error(err);
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
			callback(null);
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
			logdata : "extension conf doesn't have a valid name"
		});
	}
	else if(!semver.valid(extToAdd.version)){
		install_logErrorOutput({
			logfile : logfile,
			logdata : "extension conf doesn't have a valid semver"
		});
	}
	else if(!semver.valid(extToAdd.periodicConfig.periodicCompatibility)){
		install_logErrorOutput({
			logfile : logfile,
			logdata : "extension conf doesn't have a valid periodic semver"
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
					logdata : err.message
				});
			}
			else{
				install_logOutput({
					logfile : logfile,
					logdata : extToAdd.name+' installed, extensions.conf updated, application restarting \r\n  ====##END##====',
					callback : function(err){
					}
				});
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

	applicationController.loadExtensions({
		periodicsettings:appSettings,
		callback:function(err,extensions){
			if(err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message
				});
			}
			else{
				currentExtensionsConf = extensions;
				console.log('currentExtensionsConf',currentExtensionsConf);
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
							logdata : err.message
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
							logfile : logfile
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
						extname : options.extname
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
						logdata : err.message
					});
				}
				else{
					fs.copy(extdir,extpublicdir,function(err){
						if (err) {
							install_logErrorOutput({
								logfile : logfile,
								logdata : err.message
							});
						}
						else{
							install_logOutput({
								logfile : logfile,
								logdata : 'Copied public files',
								callback : function(err){
									install_updateExtConf({
										logfile : options.logfile,
										extname : options.extname
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
					logdata : err.message
				});
			}
			else{
				npm.commands.install([repourl], function (err, data) {
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
										extname: reponame.split('/')[1]
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

var install = function(req, res, next){
    var repoversion = req.query.version,
        reponame = req.query.name,
        repourl = (repoversion==='latest' || !repoversion) ?
            'https://github.com/'+reponame+'/archive/master.tar.gz' :
            'https://github.com/'+reponame+'/tarball/'+repoversion,
        timestamp = (new Date()).getTime(),
        logdir= path.resolve(__dirname,'../../content/extensions/log/'),
		logfile=path.join(logdir,'install-ext.'+req.user._id+'.'+ applicationController.makeNiceName(reponame) +'.'+timestamp+'.log'),
		myData = {
			result:"start",
			data:{
				message:"beginning extension install: "+reponame,
				time:timestamp
			}
		},
		extdir = path.join(process.cwd(),'content/extensions/node_modules');
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

var disable = function(req,res,next){
	var id =req.params.id;
	console.log("id",id);
};

var enable = function(req,res,next){
	var id =req.params.id;
	console.log("id",id);
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		install:install,
		install_getOutputLog:install_getOutputLog,
		disable:disable,
		enable:enable
	};
};

module.exports = controller;