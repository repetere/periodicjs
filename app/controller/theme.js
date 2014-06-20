'use strict';
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/model/workout.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/model/media.js
// https://github.com/yawetse/getperiodic/blob/master/webapp/db/schema.js
// https://github.com/getperiodic/app.web-app/blob/master/dist/app/controller/home.js
// https://github.com/getperiodic/app.web-app/blob/master/dist/app/routes/home.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/controller/exercise.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/controller/application.js
var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	semver = require('semver'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	logger,
	User, Category, Post;

var customLayout = function(options){
	var pagedata = options.pagedata,
		viewtype = options.viewtype,
		viewpath = options.viewpath,
		req = options.req,
		res = options.res,
		next = options.next,
		pluginname = options.pluginname,
		themepath = appSettings.themepath,
		themefileext = appSettings.templatefileextension,
		viewfilepath = (options.viewtype ==='theme')?
			path.join(themepath,'views',viewpath+'.'+themefileext) :
			path.join(process.cwd(),'content/extensions/node_modules',pluginname,'views',viewpath+'.'+themefileext),
		parallelTask = {};

	function getModelFromName(modelname){
		switch(modelname){
			case 'Category':
				return Category;
			case 'Post':
				return Post;
		}
	}
	function getTitleNameQuerySearch(searchterm){
		var searchRegEx = new RegExp(applicationController.stripTags(searchterm), "gi");

		if(searchterm===undefined || searchterm.length<1){
			return {};
		}
		else{
			return {
				$or: [{
					title: searchRegEx,
					}, {
					'name': searchRegEx,
				}]
			};
		}

	}
	function getAsyncCallback(functiondata){
		var querydata = (functiondata.search.customquery)? functiondata.search.customquery : getTitleNameQuerySearch(functiondata.search.query);
		return function(cb){
			console.log("functiondata.search.query",functiondata.search.query);
			applicationController.searchModel({
				model:getModelFromName(functiondata.model),
				query:querydata,
				sort:functiondata.search.sort,
				limit:functiondata.search.limit,
				offset:functiondata.search.offset,
				population:functiondata.search.population,
				callback:cb
			});
		};
	}
	for(var x in pagedata){
		parallelTask[x] = getAsyncCallback (pagedata[x]);
	}
	// an example using an object instead of an array
	async.parallel(
		parallelTask,
		function(err, results) {
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				if(next){
					req.controllerData.layoutdata = results;
					next();
				}
				else{
					res.render(viewfilepath,{
						layoutdata:results,
						pagedata: {
								title:"custom page"
						},
						user:req.user
					});
				}
			}
		    // results is now equals to: {one: 1, two: 2}
	});
};

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
			if(callback){
				callback(err);
			}
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

var updateConfigTheme = function(options){
	var themename = options.themename,
		res = options.res,
		req = options.req,
		next = options.next,
		confFilePath = path.join(process.cwd(),'content/config/config.json');

	fs.readJson(confFilePath,function(err,configFileJson){
		if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
		else{
			configFileJson.theme = themename;

			fs.outputJson(
				confFilePath,
				configFileJson,
				function(err){
					if(err){
						applicationController.handleDocumentQueryErrorResponse({
							err:err,
							res:res,
							req:req,
							redirecturl:'/p-admin/themes'
						});
					}
					else{
						applicationController.handleDocumentQueryRender({
							req:req,
							res:res,
							redirecturl:'/p-admin/themes',
							responseData:{
								result:"success",
								data:{
									theme:themename,
									msg:'theme enabled'
								}
							}
						});
					}
				}
			);
		}
	});
};

var getThemeConfig = function(options){
	var themeConfigFile = path.join(process.cwd(),'content/themes',options.themename,'periodicjs.theme.json');
	fs.readJson(themeConfigFile, options.callback);
};

var enable = function(req,res,next){
	var themename = req.params.id,
		currentTheme = appSettings.theme;

	getThemeConfig({themename:themename,
		callback:function(err,themedata){
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				try{
					if(!semver.lte(
						themedata.periodicCompatibility,appSettings.version)
						){
						applicationController.handleDocumentQueryErrorResponse({
							err:new Error('This theme requires periodic version: '+themedata.periodicCompatibility+' not: '+appSettings.version),
							res:res,
							req:req
						});
					}
					else{
						updateConfigTheme({
							themename:themename,
							req: req,
							res: res,
							next: next
						});
					}
				}
				catch(e){
					applicationController.handleDocumentQueryErrorResponse({
						err:e,
						res:res,
						req:req
					});
				}
			}
		}
	});
};

var install_removeThemeFromConf = function(options){
	var extname = options.extname,
		logfile = options.logfile,
		confFilePath = path.join(process.cwd(),'content/config/config.json');

	fs.readJson(confFilePath,function(err,configFileJson){
		if(err){
			install_logErrorOutput({
				logfile : logfile,
				logdata : err.message
			});
		}
		else{
			configFileJson.theme = '';

			fs.outputJson(
				confFilePath,
				configFileJson,
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
					}
				}
			);
		}
	});
};

var uninstall_removeFiles = function(options){
	var themedir = options.themedir,
		repourl = options.repourl,
		themename = options.themename,
		logfile = options.logfile;

	fs.remove(path.resolve(themedir,themename), function(err){
		if (err){
			logger.error(err);
		}
		else{
			// install_removeThemeFromConf({
			// 	logfile : logfile,
			// 	themename: themename
			// });
			install_logOutput({
				logfile : logfile,
				logdata : themename+' removed, application restarting \r\n  ====##REMOVED-END##====',
				callback : function(err){
				}
			});

			fs.remove(path.resolve(__dirname,'../../public/themes/',themename), function(err){
				if (err){
					logger.error(err);
				}
				else{
					logger.info("removed theme public dir files");
				}
			});
		}
	});
};

var remove = function(req, res, next){
    var themename = req.params.id,
        timestamp = (new Date()).getTime(),
        logdir= path.resolve(__dirname,'../../content/themes/log/'),
		logfile=path.join(logdir,'remove-theme.'+req.user._id+'.'+ applicationController.makeNiceName(themename) +'.'+timestamp+'.log'),
		myData = {
			result:"start",
			data:{
				message:"beginning theme removal: "+themename,
				time:timestamp
			}
		},
		themedir = path.join(process.cwd(),'content/themes');

	if(themename === appSettings.theme){
		applicationController.handleDocumentQueryErrorResponse({
			err:new Error('Cannot delete active theme'),
			res:res,
			req:req
		});
	}
	else{
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
									repo:applicationController.makeNiceName(themename),
									themename:themename,
									time:timestamp
								}
							}
						});
						uninstall_removeFiles({
							themedir : themedir,
							logfile : logfile,
							themename : themename
						});
					}
			}
		});
	}
};

var remove_getOutputLog = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/themes/log/'),
		logfile=path.join(logdir,'remove-theme.'+req.user._id+'.'+applicationController.makeNiceName(req.params.theme)+'.'+req.params.date+'.log'),
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
	var logdir= path.resolve(__dirname,'../../content/themes/log/'),
		logfile=path.join(logdir,'install-theme.'+req.user._id+'.'+applicationController.makeNiceName(req.params.theme)+'.'+req.params.date+'.log'),
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

var cleanup_log = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/themes/log/'),
		logfile=path.join(logdir,req.query.mode+'-theme.'+req.user._id+'.'+applicationController.makeNiceName(req.params.theme)+'.'+req.params.date+'.log');

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

var install_themePublicDir = function(options){
	var logfile = options.logfile,
		themename = options.themename,
        themedir= path.resolve(__dirname,'../../content/themes/',themename,'public'),
        themepublicdir= path.resolve(__dirname,'../../public/themes/',themename);
		// console.log("extname",extname);
	fs.readdir(themedir,function(err,files){
		// console.log("files",files);
		if(err){
			install_logOutput({
				logfile : logfile,
				logdata : 'No Public Directory to Copy',
				callback : function(err){
					install_logOutput({
						logfile : logfile,
						logdata : themename+' installed, application restarting \r\n  ====##END##====',
						callback : function(err){
						}
					});
				}
			});
		}
		else{
			//make destination dir
			fs.mkdirs(themepublicdir, function(err){
				if (err) {
					install_logErrorOutput({
						logfile : logfile,
						logdata : err.message
					});
				}
				else{
					fs.copy(themedir,themepublicdir,function(err){
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
									install_logOutput({
										logfile : logfile,
										logdata : themename+' installed, application restarting \r\n  ====##END##====',
										callback : function(err){
										}
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

var install_viaDownload = function(options){
	var themedir = options.themedir,
		repourl = options.repourl,
		reponame = options.reponame,
		logfile = options.logfile,
		downloadtothemedir = path.join(themedir,reponame.split('/')[1]),
		download = require('download'),
		dlsteam;
	console.log("reponame",reponame);
	console.log("downloadtothemedir",downloadtothemedir);
	fs.ensureDir(downloadtothemedir, function(err) {
		if(err){
			install_logErrorOutput({
				logfile : logfile,
				logdata : err.message
			});
		}
		else{
			dlsteam = download(repourl,downloadtothemedir, { extract: true, strip:1 });
			dlsteam.on("response",function(res){
				install_logOutput({
					logfile : logfile,
					logdata : reponame+' starting download'
				});
			});
			dlsteam.on("data",function(){
				install_logOutput({
					logfile : logfile,
					logdata : 'downloading data'
				});
				logger.info('downloading data');
			});
			dlsteam.on("error",function(err){
				install_logErrorOutput({
					logfile : logfile,
					logdata : err.message
				});
			});
			dlsteam.on("close",function(err){
				install_logOutput({
					logfile : logfile,
					logdata : reponame+' downloaded'
				});
				install_themePublicDir({
					logfile : logfile,
					themename: reponame.split('/')[1]
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
        logdir= path.resolve(__dirname,'../../content/themes/log/'),
		logfile=path.join(logdir,'install-theme.'+req.user._id+'.'+ applicationController.makeNiceName(reponame) +'.'+timestamp+'.log'),
		myData = {
			result:"start",
			data:{
				message:"beginning theme install: "+reponame,
				time:timestamp
			}
		},
		themedir = path.join(process.cwd(),'content/themes');
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
					install_viaDownload({
						themedir : themedir,
						repourl : repourl,
						logfile : logfile,
						reponame : reponame
					});
				}
		}
	});
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	Post = mongoose.model('Post');
	User = mongoose.model('User');
	Category = mongoose.model('Category');

	return{
		customLayout:customLayout,
		enable:enable,
		remove:remove,
		remove_getOutputLog:remove_getOutputLog,
		cleanup_log:cleanup_log,
		install:install,
		install_getOutputLog:install_getOutputLog
	};
};

module.exports = controller;