'use strict';

var path = require('path'),
	async = require('async'),
	fs = require('fs-extra'),
	multer = require('multer'),
	moment = require('moment'),
	str2json = require('string-to-json'),
	formidable = require('formidable'),
	extend = require('util-extend'),
	upload_dir = '/public/uploads/files/',
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Asset,
	User,
	Contenttypes,
	coreControllerOptions,
	controllerRoutes,
	logger;

// var handleFileObjReturn = function(){
// };

var multiupload_rename = function(fieldname,filename,req,res){
	// console.log('multiupload_rename req.body', req.body);
	// console.log('multiupload_rename req', req);
	// console.log('fieldname,filename,',fieldname,filename);
	var userstampstring=(!req.body['exclude-userstamp'] && req.user)? req.user._id+'-' : '',
		timestampstringformat = req.body['ts-format'] || 'YYYY-MM-DD_HH-m-ss',
		timestampstring = (!req.body['exclude-timestamp'] )? '-'+moment().format(timestampstringformat) : '';
	if(req.body['existing-file-name']){
		return filename;
	}
	else{
		return userstampstring+filename+timestampstring;
	}
};

var multiupload_changeDest = function(dest, req, res) {
	var current_date = moment().format('YYYY/MM/DD');
	var	upload_path_dir = (req.localuploadpath) ? req.localuploadpath : path.join(process.cwd(), upload_dir,current_date);
  		// return upload_path_dir; 

	// logger.debug('upload_path_dir',upload_path_dir);
	fs.ensureDirSync(upload_path_dir);
	return upload_path_dir; 
};

var multiupload_onParseStart = function () {
  logger.debug('Form parsing started at: ', new Date());
};

var multiupload = multer({
	includeEmptyFields: false,
	putSingleFilesInArray: true,
	dest:path.join(process.cwd(), upload_dir,'/tmp'),
	rename: multiupload_rename,
	changeDest: multiupload_changeDest,
	onParseStart: multiupload_onParseStart,
	onParseEnd: function(req,next){
		logger.debug('req.body',req.body);
		logger.debug('req.files',req.files);
		var files = [],
			file_obj,
			get_file_obj= function(data){
				var returndata = data;
				returndata.uploaddirectory = returndata.path.replace(process.cwd(),'').replace(returndata.name,'');
				return returndata;
			};
		for(var x in req.files){
			if(Array.isArray(req.files[x])){
				for (var y in req.files[x]){
					file_obj = get_file_obj( req.files[x][y]);
					// file_obj.uploaddirectory = file_obj.path.replace(process.cwd(),'');
					// file_obj.uploaddirectory = file_obj.uploaddirectory.replace(file_obj.name,'');
					files.push(file_obj);
				}
			}
			else{
				file_obj = get_file_obj(req.files[x]);
				// file_obj.uploaddirectory = file_obj.path.replace(process.cwd(),'');
				// file_obj.uploaddirectory = file_obj.uploaddirectory.replace(file_obj.name,'');
				files.push(file_obj);
			}
		}
		req.controllerData = (req.controllerData) ? req.controllerData : {};
		req.controllerData.files = files;
		next();
	}
});	

var localupload = multiupload;
var get_asset_object_from_file = function(options){
	var newasset = {},
		file = options.file,
		req = options.req || { user :{}};
	newasset.attributes = {};
	newasset.size = file.size;
	newasset.filename = file.name;
	newasset.assettype = file.mimetype;
	// newasset.path = path;
	newasset.locationtype = file.locationtype || 'local';
	newasset.attributes.fieldname = file.fieldname;
	if(newasset.locationtype==='local'){
		newasset.attributes.periodicDirectory = file.uploaddirectory;
		newasset.attributes.periodicPath = path.join(file.uploaddirectory, file.name);
	}
	newasset.fileurl = file.fileurl || newasset.attributes.periodicPath.replace('/public', '');
	newasset.attributes.periodicFilename = file.name;
	newasset.attributes.etag = file.etag || null;
	newasset.attributes.lastModified = file.lastModified || null;
	newasset.attributes.delimiter = file.delimiter || null;
	newasset.attributes.location = file.location || null;
	if(file.attributes){
		newasset.attributes = extend(file.attributes,newasset.attributes);
	}
	// console.log('newasset',newasset);
	// newasset = extend(file,newasset);
	newasset.name = CoreUtilities.makeNiceName(file.name);
	newasset.title = newasset.title || newasset.name;
	newasset.author = req.user._id;
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
	return newasset;
};

var create_asset = function(options,callback){
	// console.log('create_asset options',options);
	var newasset = get_asset_object_from_file(options);
	Asset.create(newasset,callback);
};

var create_assets_from_files = function(req, res, next){
	var assets=[];
	if(req.controllerData.files){
		async.eachSeries(req.controllerData.files,
			function(file,eachcb){
				create_asset({file:file,req:req},function(err,savedasset){
					// console.log('create_assets_from_files err',err);
					// console.log('create_assets_from_files savedasset',savedasset);
					assets.push(savedasset);
					eachcb(err);
				});

			},
			function(err){
			if(err){
				next(err);
			}
			else{
				req.controllerData = (req.controllerData) ? req.controllerData : {};
				req.controllerData.assets = assets;
				next();	
			}
		});
	}
	else{
		next();
	}
};

var upload = function (req, res, next) {
	console.log('req.body',req.body);
	console.log('req.files',req.files);
	var form = new formidable.IncomingForm(),
		files = [],
		returnFile,
		returnFileObj = {},
		formfields,
		formfiles,
		d = new Date(),
		uploadDirectory = '/public/uploads/files/' + d.getUTCFullYear() + '/' + d.getUTCMonth() + '/' + d.getUTCDate(),
		fullUploadDir = path.join(process.cwd(), uploadDirectory);
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	// console.log('form',form);
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
				formfields = fields;
				formfiles = files;
				logger.silly('formfields', formfields);
				// console.log('formfiles',formfiles);
				// console.log('formfiles.length',formfiles.length);
				// console.log('Object.keys(formfiles).length',Object.keys(formfiles).length);
				// if(!formfiles || Object.keys(formfiles).length<1){
				// 	// req.end();
				// }
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
				if(file.size >0 ){
					returnFile = file;
					files.push(file);	
				}
				// else{
				// 	logger.silly('on file is empty',file);
				// }
			});
			form.on('end', function () {
				logger.silly('TODO: make file uploads async.parallel and rename multiple files');
				try{
					if(!formfiles || Object.keys(formfiles).length<1 || files <1){
						console.log('formfields',formfields);
						req.body = formfields;
						next();
					}
					else{
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
								req.controllerData.fileData = extend(returnFileObj,formfields);
								next();
							}
						});
					}
				}
				catch(e){
					CoreController.handleDocumentQueryErrorResponse({
						err: e,
						res: res,
						req: req
					});
				}
			});
		}
	});
};

var assetcreate = function(req,res){
	var successredirect = req.redirectpath ||  '/p-admin/content/assets/';
	CoreController.respondInKind({
		req : req,
		res : res,
		redirecturl: successredirect,
		// err : err,
		responseData : {
			asset: req.controllerData.asset,
			assets: req.controllerData.assets
		},
		// callback : callback
	});
};

var createassetfile = function (req, res) {
	// var form = new formidable.IncomingForm();
	// console.log('create asset file form parse');
	// form.parse(req, function (err, fields, files) {
	// 	console.log(err, fields, files);
	// });
	// console.log('req',req);
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
		model: Asset,
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
					model: Asset,
					newdoc: newasset,
					res: res,
					req: req,
					successredirect: req.redirectpath ||  '/p-admin/asset/edit/',
					appendid: true
				});
			}
		}
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
					model: Asset,
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
					redirecturl: req.redirectpath ||  '/p-admin/content/assets',
					responseData: {
						result: 'success',
						data: asset
					}
				});
			}
		});
	}
	// console.log('asset', asset);
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
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	Asset = mongoose.model('Asset');
	User = mongoose.model('User');
	Contenttypes = mongoose.model('Contenttype');
	coreControllerOptions = {
		model_name:'asset',
		load_model_population:'author contenttypes tags categories authors' ,
		load_multiple_model_population:'author contenttypes tags categories authors',
		use_full_data:false,
	};
	controllerRoutes = CoreController.controller_routes(coreControllerOptions);
	controllerRoutes.upload = upload;
	controllerRoutes.multiupload = multiupload;
	controllerRoutes.localupload = localupload;
	controllerRoutes.createassetfile = createassetfile;
	controllerRoutes.create_asset = create_asset;
	controllerRoutes.assetcreate = assetcreate;
	controllerRoutes.create_assets_from_files = create_assets_from_files;
	controllerRoutes.rename = multiupload_rename;
	controllerRoutes.searchResults = searchResults;
	controllerRoutes.remove = remove;
	controllerRoutes.changeDest = multiupload_changeDest;
	controllerRoutes.onParseStart = multiupload_onParseStart;
	controllerRoutes.upload_dir = upload_dir;
	controllerRoutes.get_asset_object_from_file = get_asset_object_from_file;
	return controllerRoutes;
};

module.exports = controller;
