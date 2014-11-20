'use strict';

var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	str2json = require('string-to-json'),
	formidable = require('formidable'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	MediaAsset,
	User,
	Contenttypes,
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

var show = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'asset/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.asset.title
					},
					asset: req.controllerData.asset,
					user: req.user
				}
			});
		}
	);
};

var index = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'asset/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Assets'
					},
					assets: req.controllerData.assets,
					user: req.user
				}
			});
		}
	);
};
var createassetfile = function (req, res) {
	var newasset = CoreUtilities.removeEmptyObjectValues(req.controllerData.fileData);
	newasset.name = CoreUtilities.makeNiceName(newasset.fileurl);
	newasset.title = newasset.title || newasset.name;
	newasset.author = req.user._id;
	newasset = str2json.convert(newasset);
	newasset.changes= [{
		editor:req.user._id,
		editor_username:req.user.username,
		changeset:{
			title:newasset.title,
			name:newasset.name,
			content:newasset.content,
			tags: (newasset.tags && Array.isArray(newasset.tags)) ? newasset.tags: [newasset.tags],
			categories: (newasset.tags && Array.isArray(newasset.categories)) ? newasset.categories: [newasset.categories],
			assets: (newasset.tags && Array.isArray(newasset.assets)) ? newasset.assets: [newasset.assets],
			contenttypes: (newasset.tags && Array.isArray(newasset.contenttypes)) ? newasset.contenttypes: [newasset.contenttypes],
			contenttypeattributes:newasset.contenttypeattributes
		}
	}];


	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
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
	var updateasset = CoreUtilities.removeEmptyObjectValues(req.body),
		saverevision= (typeof req.saverevision ==='boolean')? req.saverevision : true;

	updateasset.name = CoreUtilities.makeNiceName(updateasset.title);
	updateasset = str2json.convert(updateasset);

	CoreController.updateModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: MediaAsset,
		id: updateasset.docid,
		updatedoc: updateasset,
		forceupdate: req.forceupdate,
		saverevision: saverevision,
		originalrevision: req.controllerData.asset,
		population: 'contenttypes parent',
		res: res,
		req: req,
		successredirect: req.redirectpath ||  '/p-admin/mediaasset/edit/',
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
					cached: req.headers.periodicCache !== 'no-periodic-cache',
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

var loadAssetWithCount = function (req, res, next) {
	req.headers.loadcontenttypecount = true;
	next();
};

var loadAssetWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.contenttypesperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getAssetData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.assetsperpage,
		offset = req.query.offset || (pagenum*limit),
		population = options.population,
		orQuery = options.orQuery,
		searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi'),
		parallelFilterTask = {};

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	if(req.query.ids){
		var queryIdArray=[];
		if(Array.isArray(req.query.ids)){
			queryIdArray = req.query.ids;
		}
		else if(typeof req.query.ids ==='string'){
			queryIdArray = req.query.ids.split(',');
		}
		orQuery.push({
			'_id': {$in:queryIdArray}
		});
	}
	else if (req.query.search !== undefined && req.query.search.length > 0) {
		orQuery.push({
			title: searchRegEx
		}, {
			'name': searchRegEx
		});
	}

	parallelFilterTask.authors = function(cb){
		if(req.query.filter_authors){
			var authorsArray = (typeof req.query.filter_authors==='string') ? req.query.filter_authors.split(',') : req.query.filter_authors;

			User.find({'username':{$in:authorsArray}},'_id', function( err, userids){
				cb(err, userids);
			});
		}
		else{
			cb(null,null);
		}
	};

	parallelFilterTask.contenttypes = function(cb){
		if(req.query.filter_contenttypes){
			var contenttypesArray = (typeof req.query.filter_contenttypes==='string') ? req.query.filter_contenttypes.split(',') : req.query.filter_contenttypes;
			Contenttypes.find({'name':{$in:contenttypesArray}},'_id', function( err, contenttypeids){
				cb(err, contenttypeids);
			});
		}
		else{
			cb(null,null);
		}
	};	
	async.parallel(
		parallelFilterTask,
		function(err,filters){
			if(err){
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else{
				if(filters.authors){
					var aarray =[];
					for(var w in filters.authors){
						aarray.push(filters.authors[w]._id);
					}
					// console.log('ctarray',ctarray);
					orQuery.push({'author':{$in:aarray}});
				}
				if(filters.contenttypes){
					var ctarray =[];
					for(var z in filters.contenttypes){
						ctarray.push(filters.contenttypes[z]._id);
					}
					// console.log('ctarray',ctarray);
					orQuery.push({'contenttypes':{$in:ctarray}});
				}
				
				if(orQuery.length>0){
					query = {
						$and: orQuery
					};
				}

				parallelTask.assetscount = function(cb){
					if(req.headers.loadcontenttypecount){
						MediaAsset.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.assetsquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: MediaAsset,
						query: query,
						sort: sort,
						limit: limit,
						offset: offset,
						population: population,
						callback: function (err, documents) {
							cb(err,documents);
						}
					});
				};

				async.parallel(
					parallelTask,
					function(err,results){
						if(err){
							CoreController.handleDocumentQueryErrorResponse({
								err: err,
								res: res,
								req: req
							});
						}
						else{
							// console.log(results);
							req.controllerData.assets = results.assetsquery;
							req.controllerData.assetscount = results.assetscount;
							if(callback){
								callback(req, res);
							}
							else{
								next();								
							}
						}
				});	
			}
	});
};

var loadAssets = function (req, res, next) {
	var query,
		population = 'author contenttypes',
		orQuery = [];

	getAssetData({
		req: req,
		res: res,
		next: next,
		population: population,
		query: query,
		orQuery: orQuery
	});
};

var loadAsset = function (req, res, next) {
	var params = req.params,
		population = 'author contenttypes tags categories authors',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
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
	User = mongoose.model('User');
	Contenttypes = mongoose.model('Contenttype');

	return {
		show: show,
		index: index,
		remove: remove,
		upload: upload,
		createassetfile: createassetfile,
		update: update,
		loadAsset: loadAsset,
		getAssetData: getAssetData,
		loadAssetWithDefaultLimit: loadAssetWithDefaultLimit,
		loadAssetWithCount:loadAssetWithCount,
		loadAssets: loadAssets,
		searchResults: searchResults
	};
};

module.exports = controller;
