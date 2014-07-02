'use strict';

var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	util = require('util'),
	formidable = require('formidable'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	MediaAsset,
	logger;

var upload = function(req,res,next){
	var form = new formidable.IncomingForm(),
        files = [],
        returnFile,
        returnFileObj={},
        fields = [],
        d = new Date(),
        uploadDirectory = '/public/uploads/files/'+d.getUTCFullYear()+'/'+d.getUTCMonth()+'/'+d.getUTCDate(),
        fullUploadDir = path.join(process.cwd(),uploadDirectory);
    req.controllerData = (req.controllerData)?req.controllerData:{};
    fs.ensureDir(fullUploadDir,function(err){
		if(err){
			applicationController.handleDocumentQueryErrorResponse({
				err:err,
				res:res,
				req:req
			});
		}
		else{
			// http://stackoverflow.com/questions/20553575/how-to-cancel-user-upload-in-formidable-node-js
			form.keepExtensions = true;
			form.uploadDir = fullUploadDir;
			form.parse(req, function(err, fields, files) {
				// console.log(err,fields,files);
			});
		    form.on('error', function(err) {
				logger.error(err);
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			});
		    form.on('file', function(field, file) {
				returnFile = file;
				files.push(file);
			});
		    form.on('end',function(){
				var newfilename = req.user._id.toString()+'-'+applicationController.makeNiceName( path.basename(returnFile.name, path.extname(returnFile.name)) )+path.extname(returnFile.name),
					newfilepath = path.join(fullUploadDir,newfilename);
				fs.rename(returnFile.path,newfilepath,function(err){
					if(err){
						applicationController.handleDocumentQueryErrorResponse({
							err:err,
							res:res,
							req:req
						});
					}
					else{
						returnFileObj.attributes = {};
						returnFileObj.size = returnFile.size;
						returnFileObj.filename = returnFile.name;
						returnFileObj.assettype = returnFile.type;
						returnFileObj.path = newfilepath;
						returnFileObj.locationtype = 'local';
						returnFileObj.attributes.periodicDirectory= uploadDirectory;
						returnFileObj.attributes.periodicPath= path.join(uploadDirectory,newfilename);
						returnFileObj.fileurl= returnFileObj.attributes.periodicPath.replace('/public','');
						returnFileObj.attributes.periodicFilename = newfilename;
						// console.log("returnFileObj",returnFileObj);
						req.controllerData.fileData = returnFileObj;
						next();
					}
				});
		    });
		}
    });
};

var createassetfile = function(req, res, next) {
	var newasset = applicationController.removeEmptyObjectValues(req.controllerData.fileData);
	newasset.name = applicationController.makeNiceName(newasset.fileurl);
	newasset.postauthorname = req.user.username;
	newasset.primaryauthor = req.user._id;
	newasset.authors = [req.user._id];

	// res.status(500);
	// res.send("crap error");
// console.log("newasset",newasset);
    applicationController.createModel({
	    model:MediaAsset,
	    newdoc:newasset,
	    res:res,
        req:req,
	    successredirect:'/p-admin/media/edit/',
	    appendid:true
	});
};


var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	MediaAsset = mongoose.model('Asset');
	// Collection = mongoose.model('Collection');

	return{
		// show:show,
		// index:index,
		upload:upload,
		createassetfile:createassetfile,
		// update:update,
		// append:append,
		// loadCollection:loadCollection,
		// loadCollections:loadCollections
	};
};

/*
// console.log("req",req);
	// http://stackoverflow.com/questions/20553575/how-to-cancel-user-upload-in-formidable-node-js
	form.keepExtensions = true;
	form.uploadDir = path.join(process.cwd(),uploadDirectory);
	form.parse(req, function(err, fields, files) {
		// console.log(err,fields,files);
	  // res.writeHead(200, {'content-type': 'text/plain'});
	  // res.write('received upload:\n\n');
	  // res.end(util.inspect({fields: fields, files: files}));
	});
	form.on('error', function(err) {
		logger.error(err);
		applicationController.handleDocumentQueryErrorResponse({
			err:err,
			res:res,
			req:req
		});
	});

	    form.on('field', function(field, value) {
			console.log("field, value");
			console.log(field, value);
			fields.push([field, value]);
		});
			    form.on('file', function(field, file) {
			console.log("field, file");
			// console.log(field, file);
			if(file.size > 9){
				this.emit("aborted",'file too big');
				this.emit("error",'file too big error',file);
			} 
						files.push(file);
	});
	form.on('end',function(){
		req.controllerData.fileData = files;
		next();
	});
*/

module.exports = controller;