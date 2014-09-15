'use strict';

var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	formidable = require('formidable'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	MediaAsset,
	logger;

var upload = function (req, res, next) {
	var form = new formidable.IncomingForm(),
		files = [],
		returnFile,
		returnFileObj = {},
		// fields = [],
		d = new Date(),
		uploadDirectory = '/public/uploads/files/' + d.getUTCFullYear() + '/' + d.getUTCMonth() + '/' + d.getUTCDate(),
		fullUploadDir = path.join(process.cwd(), uploadDirectory);
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	fs.ensureDir(fullUploadDir, function (err) {
		if (err) {
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
		else {
			// http://stackoverflow.com/questions/20553575/how-to-cancel-user-upload-in-formidable-node-js
			form.keepExtensions = true;
			form.uploadDir = fullUploadDir;
			form.parse(req, function (err, fields, files) {
				logger.silly(err, fields, files);
			});
			form.on('error', function (err) {
				logger.error(err);
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			});
			form.on('file', function (field, file) {
				returnFile = file;
				files.push(file);
			});
			form.on('end', function () {
				var newfilename = req.user._id.toString() + '-' + CoreUtilities.makeNiceName(path.basename(returnFile.name, path.extname(returnFile.name))) + path.extname(returnFile.name),
					newfilepath = path.join(fullUploadDir, newfilename);
				fs.rename(returnFile.path, newfilepath, function (err) {
					if (err) {
						CoreController.handleDocumentQueryErrorResponse({
							err: err,
							res: res,
							req: req
						});
					}
					else {
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
						// console.log('returnFileObj',returnFileObj);
						req.controllerData.fileData = returnFileObj;
						next();
					}
				});
			});
		}
	});
};

var createassetfile = function (req, res) {
	var newasset = CoreUtilities.removeEmptyObjectValues(req.controllerData.fileData);
	newasset.name = CoreUtilities.makeNiceName(newasset.fileurl);
	newasset.author = req.user._id;
	CoreController.loadModel({
		model: MediaAsset,
		docid: newasset.name,
		callback: function (err, assetdoc) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (assetdoc) {
				// console.log('assetdoc', assetdoc);
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					responseData: {
						result: 'success',
						data: {
							doc: assetdoc
						}
					}
				});
			}
			else {
				CoreController.createModel({
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

var update = function (req, res) {
	var updateasset = CoreUtilities.removeEmptyObjectValues(req.body);

	updateasset.name = CoreUtilities.makeNiceName(updateasset.title);

	CoreController.updateModel({
		model: MediaAsset,
		id: updateasset.docid,
		updatedoc: updateasset,
		saverevision: false,
		population: 'contenttypes parent',
		res: res,
		req: req,
		successredirect: '/p-admin/mediaasset/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var asset = req.controllerData.asset;
	if (asset.locationtype === 'local') {
		async.parallel({
			deletefile: function (callback) {
				fs.remove(path.join(process.cwd(), asset.attributes.periodicPath), callback);
			},
			removeasset: function (callback) {
				CoreController.deleteModel({
					model: MediaAsset,
					deleteid: asset._id,
					req: req,
					res: res,
					callback: callback
				});
			}
		}, function (err
			//, results
		) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				CoreController.handleDocumentQueryRender({
					req: req,
					res: res,
					redirecturl: '/p-admin/assets',
					responseData: {
						result: 'success',
						data: asset
					}
				});
			}
		});
	}
	console.log('asset', asset);
};

var loadAssets = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'author contenttypes',
		searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi');

	req.controllerData = (req.controllerData) ? req.controllerData : {};
	if (req.query.search === undefined || req.query.search.length < 1) {
		query = {};
	}
	else {
		query = {
			$or: [{
				title: searchRegEx
			}, {
				'name': searchRegEx
			}]
		};
	}

	CoreController.searchModel({
		model: MediaAsset,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		population: population,
		callback: function (err, documents) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				// console.log(documents);
				req.controllerData.assets = documents;
				next();
			}
		}
	});
};

var loadAsset = function (req, res, next) {
	var params = req.params,
		population = 'author contenttypes',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		docid: docid,
		model: MediaAsset,
		population: population,
		callback: function (err, doc) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.asset = doc;
				next();
			}
		}
	});
};

var searchResults = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'search/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Search Results'
					},
					assets: req.controllerData.assets,
					user: CoreUtilities.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	MediaAsset = mongoose.model('Asset');
	// Collection = mongoose.model('Collection');

	return {
		// show:show,
		// index:index,
		remove: remove,
		upload: upload,
		createassetfile: createassetfile,
		update:update,
		// append:append,
		loadAsset: loadAsset,
		loadAssets: loadAssets,
		searchResults: searchResults
	};
};

module.exports = controller;
