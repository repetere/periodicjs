'use strict';

var path = require('path'),
		async = require('async'),
		fs = require('fs-extra'),
		mongoose = require('mongoose'),
		appController = require(path.join(process.cwd(),'app/controller/application')),
		logdir = path.resolve(process.cwd(),'logs/'),
		logfile = path.join(logdir,'install-periodicjs.log'),
		applicationController,
		appSettings,
		logger;

var errorlog_outputlog = function(options){
	var logdata = options.logdata+'\r\n ';
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

var update_outputlog = function(options){
	var logdata = options.logdata+'\r\n',
			callback = options.callback;

	fs.appendFile(logfile,logdata,function(err){
		if(err){
			logger.error(err);
			callback(err);
			//try and write message to end console
			errorlog_outputlog({
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

var get_outputlog = function(req,res,next){
	var stat = fs.statSync(logfile),
			readStream = fs.createReadStream(logfile);

	res.writeHead(200, {
		'Content-Type': ' text/plain',
		'Content-Length': stat.size
	});
	readStream.pipe(res);
};

var configurePeriodic = function(req,res,next,options){
	var updatesettings = options.updatesettings,
			userdata = options.userdata,
			userSchema = require(path.resolve(process.cwd(),'app/model/user.js')),
			User = mongoose.model('User',userSchema),
			asyncTasks = {};

	var writeConfJson = function(){
		var confJsonFilePath = path.resolve(process.cwd(),'content/config/config.json'),
				confJson={
					"application":{
						"port": "8786",
						"environment": "development"
					},
					"cookies":{
						"cookieParser":updatesettings.cookieparser
					},
				  "theme": "periodicjs.theme."+updatesettings.theme,
				  "status":"active"
				};
		if(updatesettings.appname){
			confJson.name = updatesettings.appname;
		}
		switch(updatesettings.sessions){
			case 'mongo':
				confJson.sessions = {
					"enabled":true,
					"type":"mongo"
				};
				confJson.crsf = true;
				break;
			case 'cookie':
				confJson.sessions = {
					"enabled":true,
					"type":"cookie"
				};
				confJson.crsf = true;
				break;
			default:
				confJson.sessions = {
					"enabled":false,
					"type":"default"
				};
				confJson.crsf = false;
				break;
		}

		update_outputlog({
			logdata : 'installed, config.conf updated \r\n  ====##CONFIGURED##====',
			callback : function(err){
			}
		});
		fs.outputJson(confJsonFilePath,confJson,function(err){
			if(err){
				errorlog_outputlog({
					logdata : err.message,
					cli : options.cli
				});
			}
			else{
				if(options.cli){
					logger.info('installed, config.conf updated \r\n  ====##CONFIGURED##====');
					process.exit(0);
				}
			}
		});
	};

	var updateExtensionConf = function(callback){
		var updateConfSettings = {},
				currentExtensionsConf,
				extfilepath=path.join(process.cwd(),'/content/extensions/extensions.json'),
				ext_install,
				ext_mailer,
				ext_login,
				// ext_seed,
				ext_admin;
		updateConfSettings.extensions = [];

		fs.readJson(extfilepath,function(err,extConfJSON){
			if(err){
				callback(err,null);
			}
			else{
				currentExtensionsConf = extConfJSON;
				for(var x in currentExtensionsConf.extensions){
					if(currentExtensionsConf.extensions[x].name === 'periodicjs.ext.install'){
						ext_install=currentExtensionsConf.extensions[x];
						ext_install.enabled=false;
					}
					if(currentExtensionsConf.extensions[x].name === 'periodicjs.ext.mailer'){
						ext_mailer=currentExtensionsConf.extensions[x];
						ext_mailer.enabled=true;
					}
					if(currentExtensionsConf.extensions[x].name === 'periodicjs.ext.login'){
						ext_login=currentExtensionsConf.extensions[x];
						ext_login.enabled=true;
					}
					if(currentExtensionsConf.extensions[x].name === 'periodicjs.ext.admin'){
						ext_admin=currentExtensionsConf.extensions[x];
						ext_admin.enabled=true;
					}
				}
				updateConfSettings.extensions = [ext_install,ext_mailer,ext_login,ext_admin];
				fs.outputJson(extfilepath,updateConfSettings,function(err){
					if(err){
						callback(err,null);
					}
					else{
						update_outputlog({
							logdata : 'updated conf settings'
						});
						callback(null,"updated conf settings");
					}
				});
			}
		});
	};

	if(updatesettings.admin){
		// console.log("install admin");
		asyncTasks.createUser = function(callback){
			update_outputlog({
				logdata : 'creating admin user'
			});
			User.fastRegisterUser(userdata,callback);
		};
		asyncTasks.installMailer = function(callback){
			update_outputlog({
				logdata : 'installing mailer extension'
			});
			applicationController.async_run_cmd(
				'node',
				['index.js','--cli','--controller','extension','--install','true','--name','typesettin/periodicjs.ext.mailer','--version','latest'],
				function(consoleoutput){
					update_outputlog({
						logdata : consoleoutput
					});
				},
				callback
			);
			// node index.js --cli --controller extension --install true --name "typesettin/periodicjs.ext.install" --version latest
		};
		asyncTasks.installLogin = function(callback){
			update_outputlog({
				logdata : 'installing login extension'
			});
			applicationController.async_run_cmd(
				'node',
				['index.js','--cli','--controller','extension','--install','true','--name','typesettin/periodicjs.ext.login','--version','latest'],
				function(consoleoutput){
					update_outputlog({
						logdata : consoleoutput
					});
				},
				callback
			);
			// node index.js --cli --controller extension --install true --name "typesettin/periodicjs.ext.install" --version latest
		};
		asyncTasks.installAdmin = function(callback){
			update_outputlog({
				logdata : 'installing admin extension'
			});
			applicationController.async_run_cmd(
				'node',
				['index.js','--cli','--controller','extension','--install','true','--name','typesettin/periodicjs.ext.admin','--version','latest'],
				function(consoleoutput){
					update_outputlog({
						logdata : consoleoutput
					});
				},
				callback
			);
			// node index.js --cli --controller extension --install true --name "typesettin/periodicjs.ext.install" --version latest
		};
	}
	if(updatesettings.theme){
		asyncTasks.installTheme = function(callback){
			update_outputlog({
				logdata : 'installing theme: '+updatesettings.theme
			});
			applicationController.async_run_cmd(
				'node',
				['index.js','--cli','--controller','theme','--install','true','--name','typesettin/periodicjs.theme.'+updatesettings.theme,'--version','latest'],
				// ['index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.'+updatesettings.theme+'" --version latest'],
				function(consoleoutput){
					update_outputlog({
						logdata : consoleoutput
					});
				},
				callback
			);
			// node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest
		};
	}

	asyncTasks.writeDatabaseJson = function(callback){
		var dbjson='',
				dbjsfile=path.join(process.cwd(),'/content/config/database.js');
		dbjson+='"use strict";\r\n';
		dbjson+='\r\n';
		dbjson+='var mongoose = require("mongoose");\r\n';
		dbjson+='\r\n';
		dbjson+='module.exports = {\r\n';
		dbjson+='	"development":{\r\n';
		dbjson+='		url: "'+updatesettings.mongoconnectionurl+'",\r\n';
		dbjson+='		mongoose: mongoose,\r\n';
		dbjson+='		mongooptions:{}\r\n';
		dbjson+='	},\r\n';
		dbjson+='	"production":{\r\n';
		dbjson+='		url: "'+updatesettings.mongoconnectionurl+'",\r\n';
		dbjson+='		mongoose: mongoose,\r\n';
		dbjson+='		mongooptions:{}\r\n';
		dbjson+='	}\r\n';
		dbjson+='};\r\n';

		// logger.silly("restartfile",restartfile);
		fs.outputFile(dbjsfile,dbjson,function(err){
			if(err){
				callback(err,null);
			}
			else{
				callback(null,"updated database.json");
			}
		});
	};

	async.parallel(
		asyncTasks,
		function(err,results){
			if(err){
				errorlog_outputlog({
					logdata : err.message,
					cli : options.cli
				});
			}
			else{
				console.log(results);
				updateExtensionConf(function(err,updatestatus){
					if(err){
						errorlog_outputlog({
							logdata : err.message,
							cli : options.cli
						});
					}
					else{
						writeConfJson();
					}
				});
				// applicationController.restart_app();
			}
	});
};

var testmongoconfig = function(req,res,next,options){
	var updatesettings = options.updatesettings;
	if(mongoose.Connection.STATES.connected !== mongoose.connection.readyState){
		mongoose.connect(updatesettings.mongoconnectionurl, function(err) {
			if (err){
				errorlog_outputlog({
					logdata : err.message,
					cli : options.cli
				});
			}
			else{
				configurePeriodic(req,res,next,options);
			}
		});
	}
	else{
		configurePeriodic(req,res,next,options);
	}
};

var update = function(req, res, next){
	var updatesettings = applicationController.removeEmptyObjectValues(req.body),
			userdata = {
				username: updatesettings.username,
				email: updatesettings.email,
				password: updatesettings.password,
				passwordconfirm: updatesettings.passwordconfirm
			},
			d = new Date();
	fs.outputFile(logfile,'configuration log '+d+'- \r\n ');
	// console.log("updatesettings",updatesettings);

	update_outputlog({
		logdata : "begginning configuration install: ",
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
							message:"allgood"
						}
					}
				});
				testmongoconfig(req,res,next,{
					updatesettings:updatesettings,
					userdata:userdata
				});
			}
		}
	});
};

var index = function(req, res, next) {
	var rand = function() {
	    return Math.random().toString(36).substr(2); // remove `0.`
	};

	var token = function() {
	    return rand() + rand(); // to make it longer
	};

	applicationController.getPluginViewTemplate({
		res:res,
		req:req,
		viewname:'install/index',
		pluginname:'periodicjs.ext.install',
		themepath:appSettings.themepath,
		themefileext:appSettings.templatefileextension,
		callback:function(templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata:{
						title:'Welcome to Periodicjs',
						cookieparser:token(),
						temppassword:token().substr(0,8)
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

var controller = function(resources){
	logger = resources.logger;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		index:index,
		update:update,
		get_outputlog:get_outputlog
	};
};

module.exports = controller;