'use strict';

var path = require('path'),
	fs = require('fs-extra'),
	npm = require("npm"),
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

var readJSONFile = function(filename) {
	return JSON.parse(fs.readFileSync(filename));
};

var install_updateExtConf = function(options){
	var logfile = options.logfile,
		extname = options.extname,
		extpackfile = Extensions.getExtensionPackageJsonFilePath(extname),
		extconffile = Extensions.getExtensionPeriodicConfFilePath(extname),
		extpackfileJSON,
		extconffileJSON;
	console.log("update conf",extpackfile,extconffile);
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
				console.log("TODO: read json files, append conf to package, check for required files & fields, append to ext json conf, save ext conf json, send dont, if error anywhere dont append file, use async to read files");
				console.log("extensions",extensions);
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

    /*
    to install extensions: -https://api.github.com/repos/typesettin/periodicjs.ext.example/tags


download from github or upload zip: ex using https://github.com/jprichardson/node-github-download
run npm install in that directory to get - https://www.npmjs.org/package/npm
if public directory copy into app public dir
call periodic install extension (check for dependencies and version), if good, update extensions.json, with updated and installed date
-put content log dir, with ext name-username
     */
    /*
    
     */
};

var install_viaNPM = function(options){
	var extdir = options.extdir,
		repourl = options.repourl,
		reponame = options.reponame,
		logfile = options.logfile;
	npm.load({
			"strict-ssl" : false, prefix:extdir
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

	// res.send({url:repourl,time:timestamp});

    //https://api.github.com/repos/typesettin/periodicjs.ext.example/tags
    //https://api.github.com/search/repositories?q=periodicjs.ext.example
    //https://github.com/User/repo/archive/master.tar.gz
    //https://api.github.com/repos/typesettin/periodicjs.ext.example/tarball/0.0.2
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

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		install:install,
		install_getOutputLog:install_getOutputLog
	};
};

module.exports = controller;