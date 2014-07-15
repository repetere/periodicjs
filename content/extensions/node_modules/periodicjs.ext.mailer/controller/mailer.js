'use strict';

var path = require('path'),
		fs = require('fs-extra'),
		nodemailer = require('nodemailer'),
		appController = require(path.join(process.cwd(),'app/controller/application')),
		applicationController,
		appSettings,
		mongoose,
		logger;

//http://www.json2html.com/
var getTransport = function(callback){
	var transportJsonFile = path.resolve( __dirname,"../transport.json"),
			transportObject = {
				transportType : "direct",
				transportOptions : {debug:true}
			};

	fs.readJson(transportJsonFile, function(err, transportJSON) {
		if(err){
			logger.error(err);
			callback(err,null);
		}
		else{
			var appenvironment = appSettings.application.environment;

			if(transportJSON[appenvironment]){
				transportObject = transportJSON[appenvironment];
					callback(null,nodemailer.createTransport(transportObject.type,transportObject.transportoptions));
			}
			else{
				callback(new Error("Invalid transport configuration, no transport for env: "+appenvironment),null);
			}
			// 	

			// callback(null);
			// 	// return nodemailer.createTransport(transportType,transportOptions);

		}
	});
};

var sendmail = function(req, res, next){
	var nodemailtransport = getTransport(function(err,transport){
		if(err){
			applicationController.handleDocumentQueryErrorResponse({
				err:err,
				res:res,
				req:req
			});
		}
		else{
			var emailMessage = applicationController.removeEmptyObjectValues(req.body);
			emailMessage.generateTextFromHTML = true;

			transport.sendMail(emailMessage,function(err,response){
				if(err){
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
							pagedata: {
								title:"Email Sent"
							},
							emailresponse:response,
							user:req.user
						}
					});
				}
			});
		}
	});
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);

	return{
		sendmail:sendmail
	};
};

module.exports = controller;