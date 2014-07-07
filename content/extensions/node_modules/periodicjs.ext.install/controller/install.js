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

	if(updatesettings.admin){
		// console.log("install admin");
		asyncTasks.createUser = function(callback){
			update_outputlog({
				logdata : 'creating admin user'
			});
			User.fastRegisterUser(userdata,callback);
		};
		// asyncTasks.installMailer = function(callback){
		// 	update_outputlog({
		// 		logdata : 'installing mailer extension'
		// 	});
		// 	applicationController.async_run_cmd(
		// 		'node',
		// 		[process.cwd()+'/index.js','--cli','--controller extension','--install true','--name "typesettin/periodicjs.ext.mailer"','--version latest'],
		// 		function(consoleoutput){
		// 			update_outputlog({
		// 				logdata : consoleoutput
		// 			});
		// 		},
		// 		callback);
		// 	// node index.js --cli --controller extension --install true --name "typesettin/periodicjs.ext.install" --version latest
		// 	// 		//node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest
		// };
	}
	if(updatesettings.theme){
		// console.log("install admin");
		asyncTasks.installTheme = function(callback){
			update_outputlog({
				logdata : 'installing theme: '+updatesettings.theme
			});
			applicationController.async_run_cmd(
				'node',
				[process.cwd()+'/index.js','--cli','--controller theme','--install true','--name "typesettin/periodicjs.theme.'+updatesettings.theme+'"','--version latest'],
				function(consoleoutput){
					update_outputlog({
						logdata : consoleoutput
					});
				},
				callback);
			// node index.js --cli --controller extension --install true --name "typesettin/periodicjs.ext.install" --version latest
			// 		//node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest
		};
	}

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
				update_outputlog({
					logdata : 'installed, extensions.conf updated, application restarting \r\n  ====##END##====',
					callback : function(err){
					}
				});
				if(options.cli){
					logger.info('installed, extensions.conf updated \r\n  ====##END##====');
					process.exit(0);
				}
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