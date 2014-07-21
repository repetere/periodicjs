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

var upload = function(req, res, next) {
	var form = new formidable.IncomingForm(),
		files = [],
		returnFile,
		returnFileObj = {},
		fields = [],
		d = new Date(),
		uploadDirectory = '/public/uploads/files/' + d.getUTCFullYear() + '/' + d.getUTCMonth() + '/' + d.getUTCDate(),
		fullUploadDir = path.join(process.cwd(), uploadDirectory);
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	fs.ensureDir(fullUploadDir, function(err) {
		if(err) {
			applicationController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		} else {
			// http://stackoverflow.com/questions/20553575/how-to-cancel-user-upload-in-formidable-node-js
			form.keepExtensions = true;
			form.uploadDir = fullUploadDir;
			form.parse(req, function(err, fields, files) {
				// console.log(err,fields,files);
			});
			form.on('error', function(err) {
				logger.error(err);
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			});
			form.on('file', function(field, file) {
				returnFile = file;
				files.push(file);
			});
			form.on('end', function() {
				var newfilename = req.user._id.toString() + '-' + applicationController.makeNiceName(path.basename(returnFile.name, path.extname(returnFile.name))) + path.extname(returnFile.name),
					newfilepath = path.join(fullUploadDir, newfilename);
				fs.rename(returnFile.path, newfilepath, function(err) {
					if(err) {
						applicationController.handleDocumentQueryErrorResponse({
							err: err,
							res: res,
							req: req
						});
					} else {
						returnFileObj.attributes = {};
						returnFileObj.size = returnFile.size;
						returnFileObj.filename = returnFile.name;
						returnFileObj.assettype = returnFile.type;
						returnFileObj.path = newfilepath;
						returnFileObj.locationtype = 'local';
						returnFileObj.attributes.periodicDirectory = uploadDirectory;
						returnFileObj.attributes.periodicPath = path.join(uploadDirectory, newfilename);
						returnFileObj.fileurl = returnFileObj.attributes.periodicPath.replace('/public', '');
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
	newasset.author = req.user._id;
	applicationController.loadModel({
		model: MediaAsset,
		docid: newasset.name,
		callback: function(err, assetdoc) {
			if(err) {
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			} else if(assetdoc) {
				console.log("assetdoc", assetdoc);
				applicationController.handleDocumentQueryRender({
					req: req,
					res: res,
					responseData: {
						result: "success",
						data: {
							doc: assetdoc
						}
					}
				});
			} else {
				applicationController.createModel({
					model: MediaAsset,
					newdoc: newasset,
					res: res,
					req: req,
					successredirect: '/p-admin/media/edit/',
					appendid: true
				});
			}
		}
	});
};

var remove = function(req, res, next) {
	var asset = req.controllerData.asset;
	if(asset.locationtype === 'local') {
		async.parallel({
			deletefile: function(callback) {
				fs.remove(path.join(process.cwd(), asset.attributes.periodicPath), callback);
			},
			removeasset: function(callback) {
				applicationController.deleteModel({
					model: MediaAsset,
					deleteid: asset._id,
					req: req,
					res: res,
					callback: callback
				});
			}
		}, function(err, results) {
			if(err) {
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			} else {
				applicationController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/assets',
					responseData: {
						result: "success",
						data: "deleted"
					}
				});
			}
		});
	}
	console.log("asset", asset);
};

var loadAssets = function(req, res, next) {
	var params = req.params,
		query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'author',
		searchRegEx = new RegExp(applicationController.stripTags(req.query.search), "gi");

	req.controllerData = (req.controllerData) ? req.controllerData : {};
	if(req.query.search === undefined || req.query.search.length < 1) {
		query = {};
	} else {
		query = {
			$or: [{
				title: searchRegEx,
      }, {
				'name': searchRegEx,
      }]
		};
	}

	applicationController.searchModel({
		model: MediaAsset,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		population: population,
		callback: function(err, documents) {
			if(err) {
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			} else {
				// console.log(documents);
				req.controllerData.assets = documents;
				next();
			}
		}
	});
};

var loadAsset = function(req, res, next) {
	var params = req.params,
		population = 'author',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	applicationController.loadModel({
		docid: docid,
		model: MediaAsset,
		population: population,
		callback: function(err, doc) {
			if(err) {
				applicationController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			} else {
				req.controllerData.asset = doc;
				next();
			}
		}
	});
};

var searchResults = function(req, res, next) {
	applicationController.getViewTemplate({
		res: res,
		req: req,
		templatetype: 'search-results',
		themepath: appSettings.themepath,
		themefileext: appSettings.templatefileextension,
		callback: function(templatepath) {
			applicationController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: "Search Results"
					},
					categories: req.controllerData.assets,
					user: applicationController.removePrivateInfo(req.user)
				}
			});
		}
	});
};

var controller = function(resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	MediaAsset = mongoose.model('Asset');
	// Collection = mongoose.model('Collection');

	return {
		// show:show,
		// index:index,
		remove: remove,
		upload: upload,
		createassetfile: createassetfile,
		// update:update,
		// append:append,
		loadAsset: loadAsset,
		loadAssets: loadAssets,
		searchResults: searchResults
	};
};

module.exports = controller;
