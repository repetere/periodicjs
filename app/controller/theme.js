'use strict';
// https://www.npmjs.org/package/decompress
var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	semver = require('semver'),
	appController = require('./application'),
	Decompress = require('decompress'),
	applicationController,
	appSettings,
	mongoose,
	logger,
	User, Category, Post, Tag, Asset, Collection, Contenttype;

var customLayout = function(options){
	var req = options.req,
			res = options.res,
			next = options.next,
			parallelTask = {},
			layoutdata = options.layoutdata,
			pagetitle = (options.pagetitle) ? options.pagetitle : 'Periodic';

	Post = mongoose.model('Post');
	User = mongoose.model('User');
	Category = mongoose.model('Category');
	Tag = mongoose.model('Tag');
	Asset = mongoose.model('Asset');
	Collection = mongoose.model('Collection');
	Contenttype = mongoose.model('Contenttype');

	function getModelFromName(modelname){
		switch(modelname){
			case 'Category':
				return Category;
			case 'Post':
				return Post;
			case 'Tag':
				return Tag;
			case 'Asset':
				return Asset;
			case 'Collection':
				return Collection;
			case 'Contenttype':
				return Contenttype;
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
	for(var x in layoutdata){
		parallelTask[x] = getAsyncCallback (layoutdata[x]);
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
					var viewtype = options.viewtype,
							viewpath = options.viewpath,
							pluginname = options.pluginname,
							themepath = appSettings.themepath,
							themefileext = appSettings.templatefileextension,
							viewfilepath = (options.viewtype ==='theme')?
								path.join(themepath,'views',viewpath+'.'+themefileext) :
								path.join(process.cwd(),'content/extensions/node_modules',pluginname,'views',viewpath+'.'+themefileext);

					applicationController.handleDocumentQueryRender({
            res:res,
            req:req,
            renderView:viewfilepath,
            responseData:{
                layoutdata:results,
								pagedata: {
									title:pagetitle,
                    headerjs: [],
                },
                periodic:{
                    version: appSettings.version
                },
                user:req.user
            }
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
		if(options.cli){
			throw new Error(logdata);
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
		themename = (req.query.makenice) ? req.params.theme : applicationController.makeNiceName(req.params.theme),
		logfile=path.join(logdir,'remove-theme.'+req.user._id+'.'+themename+'.'+req.params.date+'.log'),
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

var upload_getOutputLog = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/themes/log/'),
		logfile=path.join(logdir,'install-theme.'+req.user._id+'.'+req.params.theme+'.'+req.params.date+'.log'),
		stat = fs.statSync(logfile),
		readStream = fs.createReadStream(logfile);

    res.writeHead(200, {
        'Content-Type': ' text/plain',
        'Content-Length': stat.size
    });

    readStream.pipe(res);
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
			logger.info(options.themename+' log removed \r\n  ====##END##====');
		}
	});
};

var cleanup_log = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../content/themes/log/'),
			themename = (req.query.makenice) ? req.params.theme : applicationController.makeNiceName(req.params.theme),
			logfile=path.join(logdir,req.query.mode+'-theme.'+req.user._id+'.'+themename+'.'+req.params.date+'.log');

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
					if(options.cli){
						logger.info(themename+' installed \r\n  ====##END##====');
						remove_clilog({logfile:logfile,themename:themename});
						process.exit(0);
					}
				}
			});
		}
		else{
			//make destination dir
			fs.mkdirs(themepublicdir, function(err){
				if (err) {
					install_logErrorOutput({
						logfile : logfile,
						logdata : err.message,
						cli: options.cli
					});
				}
				else{
					fs.copy(themedir,themepublicdir,function(err){
						if (err) {
							install_logErrorOutput({
								logfile : logfile,
								logdata : err.message,
								cli: options.cli
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
									if(options.cli){
										logger.info(themename+' installed \r\n  ====##END##====');
										remove_clilog({logfile:logfile,themename:themename});
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

var install_viaDownload = function(options){
	// console.log("options",options);
	var themedir = options.themedir,
		repourl = options.repourl,
		reponame = options.reponame,
		logfile = options.logfile,
		downloadtothemedir = path.join(themedir,reponame.split('/')[1]),
		download = require('download'),
		dlsteam;
	// console.log("downloadtothemedir",downloadtothemedir);
	fs.ensureDir(downloadtothemedir, function(err) {
		if(err){
			install_logErrorOutput({
				logfile : logfile,
				logdata : err.message,
				cli : true
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
					themename: reponame.split('/')[1],
					cli: options.cli
				});
			});
		}
	});
};

var move_upload = function(options){
	// console.log("options",options);
	var logfile = options.logfile,
			themename = options.themename;
	// fs.rename(returnFile.path,newfilepath,function(err){
	// });
	var decompress = new Decompress()
    .src(options.uploadedfile.path)
    .dest(options.themedir)
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
					install_themePublicDir({
						logfile : logfile,
						themename: themename
					});
				}
			});
		}
  });
};

var upload_install = function(req, res, next){
	var uploadedFile = applicationController.removeEmptyObjectValues(req.controllerData.fileData),
      timestamp = (new Date()).getTime(),
			themename = path.basename(uploadedFile.filename,path.extname(uploadedFile.filename)),
      logdir = path.resolve(__dirname,'../../content/themes/log/'),
			logfile = path.join(logdir,'install-theme.'+req.user._id+'.'+ themename +'.'+timestamp+'.log'),
			themedir = path.join(process.cwd(),'content/themes');

	install_logOutput({
			logfile : logfile,
			logdata : "installing uploaded theme",
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
									themename:themename,
									time:timestamp
								}
							}
						}
					});
					move_upload({
						themedir : themedir,
						themename:themename,
						uploadedfile:uploadedFile,
						logfile : logfile
					});
				}
		}
	});
};

var themeFunctions = {
	getlogfile : function(options){
		return path.join(options.logdir,'install-theme.'+options.userid+'.'+ applicationController.makeNiceName(options.reponame) +'.'+options.timestamp+'.log');
	},
	getrepourl : function(options){
		return (options.repoversion==='latest' || !options.repoversion) ?
            'https://github.com/'+options.reponame+'/archive/master.tar.gz' :
            'https://github.com/'+options.reponame+'/tarball/'+options.repoversion;
	},
	getlogdir : function(options){
		return path.resolve(__dirname,'../../content/themes/log/');
	},
	getthemedir : function(options){
		return path.join(process.cwd(),'content/themes');
	}
};

var install = function(req, res, next){
  var repoversion = req.query.version,
      reponame = req.query.name,
      repourl = themeFunctions.getrepourl({
				repoversion:repoversion,
				reponame:reponame
      }),
      timestamp = (new Date()).getTime(),
      logdir= themeFunctions.getlogdir(),
			logfile= themeFunctions.getlogfile({
				logdir:logdir,
				userid:req.user._id,
				reponame:reponame,
				timestamp:timestamp
			}),
			themedir = themeFunctions.getthemedir;
	//JSON.stringify(myData, null, 4)
	install_logOutput({
			logfile : logfile,
			logdata : "beginning theme install: "+reponame,
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

var cli = function(argv){
	//node index.js --cli --controller theme --install true --name "typesettin/periodicjs.theme.minimal" --version latest

	if(argv.install){
		var repoversion = argv.version,
			reponame = argv.name,
			repourl = themeFunctions.getrepourl({
				repoversion:repoversion,
				reponame:reponame
			}),
			timestamp = (new Date()).getTime(),
			logdir= themeFunctions.getlogdir(),
			logfile= themeFunctions.getlogfile({
				logdir:logdir,
				userid:'cli',
				reponame:reponame,
				timestamp:timestamp
			}),
			themedir = themeFunctions.getthemedir();

		install_logOutput({
			logfile : logfile,
			logdata : "beginning theme install: "+reponame,
			callback : function(err) {
				if(err) {
					throw new Error(err);
				}
				else {
					install_viaDownload({
						themedir : themedir,
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
		console.log(themeFunctions.getlogfile(argv));
		process.exit(0);
	}
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		customLayout:customLayout,
		enable:enable,
		remove:remove,
		remove_getOutputLog:remove_getOutputLog,
		cleanup_log:cleanup_log,
		install:install,
		upload_install:upload_install,
		install_getOutputLog:install_getOutputLog,
		upload_getOutputLog:upload_getOutputLog,
		cli:cli
	};
};

module.exports = controller;