'use strict';

var path = require('path'),
	fs = require('fs'),
	npm = require("npm"),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	logger;

var install = function(req, res, next){
    var repoversion = req.query.version,
        reponame = req.query.name,
        repourl = (repoversion==='latest' || !repoversion) ?
            'https://github.com/'+reponame+'/archive/master.tar.gz' :
            'https://github.com/'+reponame+'/tarball/'+repoversion,
        timestamp = (new Date()).getTime(),
        logdir= path.resolve(__dirname,'../../logs'),
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
	fs.appendFile(logfile, myData.data.message, function(err) {
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

			npm.load({"strict-ssl" : false}, function (er) {
				if (er){
					console.log(err);
				}
				else{
					npm.commands.install([repourl+" --prefix "+extdir], function (er, data) {
						if (er) {
							console.log(err);
						}
						else{
							console.log(data);
						}
						// command succeeded, and data might have some info
					});
					npm.on("log", function (message) {
						console.log(message);
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

	// res.send({url:repourl,time:timestamp});

    //https://api.github.com/repos/typesettin/periodicjs.ext.example/tags
    //https://api.github.com/search/repositories?q=periodicjs.ext.example
    //https://github.com/User/repo/archive/master.tar.gz
    //https://api.github.com/repos/typesettin/periodicjs.ext.example/tarball/0.0.2
var install_getOutputLog = function(req,res,next){
	var logdir= path.resolve(__dirname,'../../logs'),
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