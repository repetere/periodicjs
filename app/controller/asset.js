'use strict';

const crypto = require('crypto');
var path = require('path'),
	async = require('async'),
	multer = require('multer'),
	moment = require('moment'),
	Promisie = require('promisie'),
	fs = require('fs-extra'),
	fsRemoveAsync = Promisie.promisify(fs.remove),
	// fsRenameAsync = Promisie.promisify(fs.rename),
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
	client_encryption_algo='aes192',
	client_encryption_key_string=false,
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
  logger.debug('Form parsing started now at: ', new Date());
};

var get_client_encryption_key_string = function(){
	// console.log('path.resolve(__dirname,"../../")',path.resolve(__dirname,'../../'));
	if(!client_encryption_key_string){
		client_encryption_key_string = fs.readFileSync(path.join(path.resolve(__dirname,'../../'),appSettings.client_side_encryption_key_path),'utf8');
	}
	return client_encryption_key_string;
};

var use_client_file_encryption = function(options){
	console.log('appSettings.client_side_encryption_key_path',appSettings.client_side_encryption_key_path);
	return ((options.req.controllerData && options.req.controllerData.encryptfiles && options.req.controllerData.encryptfiles===true ) || (
			options.req.body && options.req.body.encryptfiles && (options.req.body.encryptfiles===true || options.req.body.encryptfiles==='on' || options.req.body.encryptfiles==='true')
		)) && appSettings.client_side_encryption_key_path;
};

var encrypt_file_chain = function(file,eachcb){
		var filepath =file.path;
		var encrypted_file_path=file.path+'.enc';
		file.path = encrypted_file_path;
		(function(){
			return new Promise(function(resolve,reject){
				var encryption_key_password = get_client_encryption_key_string();
				// console.log('encrypt this file',file);
				// console.log('with this string',get_client_encryption_key_string());
				var cipher = crypto.createCipher('aes192', encryption_key_password);

				var input = fs.createReadStream(filepath);
				var output = fs.createWriteStream(encrypted_file_path);

				input.pipe(cipher).pipe(output);
				output.on('finish', () => {
				  console.log('there will be no more data.');
					resolve();
				});
				input.on('error',(e)=>{
				  console.log('error encrypting file.');
					reject(e);
				});
			});
		})()
		.then(()=>{
			//delete orignal
			return fsRemoveAsync(filepath); 
		})
		.then(()=>{
			eachcb(null,file);
		})
		.catch((e)=>{
			eachcb(e);
		});
				//encrypt file
				//rename file
				//delete original file
};

var decryptAsset = function(req,res){
	req.controllerData = req.controllerData || {};
	var asset = req.controllerData.asset;
	var encrypted_file_path = path.join(process.cwd(),asset.attributes.periodicPath+'.enc');
	// res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	res.setHeader('Content-Type', asset.assettype);
	if(asset.size){
		res.setHeader('Content-Length', asset.size);
	}
	if(!req.query.nocache || !req.body.nocache || !req.controllerData.nocache){
		res.setHeader('Content-Control', 'public, max-age=86400');
	}
	if(req.params.filename !== asset.attributes.periodicFilename){
		res.status(406);
		var invalid_file_request_error = new Error('Invalid file request');
		CoreController.handleDocumentQueryErrorResponse({
			err: invalid_file_request_error,
			res: res,
			req: req
		});
	}
	else{
		var encryption_key_password = get_client_encryption_key_string();
		// console.log('decrypt this file',encrypted_file_path);
		// console.log('with this string',get_client_encryption_key_string());
		var decipher = crypto.createDecipher('aes192', encryption_key_password);

		var input = fs.createReadStream(encrypted_file_path);

		input.pipe(decipher).pipe(res);
		res.on('finish', () => {
		  logger.silly('decrypted file');
		});
		input.on('error',(e)=>{
		  logger.error('error decrypting file.',e);
			res.status(500);
			CoreController.handleDocumentQueryErrorResponse({
					err: e,
					res: res,
					req: req
				});
		});
	}
};

var multiupload = multer({
	includeEmptyFields: false,
	putSingleFilesInArray: true,
	dest:path.join(process.cwd(), upload_dir,'/tmp'),
	rename: multiupload_rename,
	changeDest: multiupload_changeDest,
	onParseStart: multiupload_onParseStart,
	onParseEnd: function(req,next){
		// logger.warn('remove setting encryptfiles');
		// // req.controllerData =  req.controllerData || {};
		// // req.controllerData.encryptfiles=true;
		// logger.debug('req.body',req.body);
		// logger.debug('req.files',req.files);
		var files = [],
			file_obj,
			use_file_encryption = use_client_file_encryption({req:req}),
			get_file_obj= function(data){
				var returndata = data;
				returndata.uploaddirectory = returndata.path.replace(process.cwd(),'').replace(returndata.name,'');
				if(use_file_encryption){
					returndata.attributes = returndata.attributes || {};
					returndata.attributes.encrypted_client_side = true;
					returndata.encrypted_client_side = true;
					returndata.attributes.client_encryption_algo = client_encryption_algo;
				}
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
		console.log('use_file_encryption',use_file_encryption);
		if(use_file_encryption){
			async.map(
				req.controllerData.files,
				encrypt_file_chain,
				function(err,encrypted_files){
					// console.log('encrypted_files',encrypted_files);
					req.controllerData.files = encrypted_files;
					next(err);
				});
		}
		else{
			next();			
		}
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
	// console.log('req.body',req.body);
	// console.log('req.files',req.files);
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
			form.maxFieldsSize = 50000000;
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
	client_encryption_algo = appSettings.client_encryption_algo || client_encryption_algo;
	coreControllerOptions = {
		model_name:'asset',
		load_model_population:'author contenttypes tags categories authors' ,
		load_multiple_model_population:'author contenttypes tags categories authors',
		use_full_data:false,
	};
	// console.log('client_encryption_algo',client_encryption_algo);
	controllerRoutes = CoreController.controller_routes(coreControllerOptions);
	controllerRoutes.upload = upload;
	controllerRoutes.multiupload = multiupload;
	controllerRoutes.use_client_file_encryption = use_client_file_encryption;
	controllerRoutes.get_client_encryption_key_string = get_client_encryption_key_string;
	controllerRoutes.encrypt_file_chain = encrypt_file_chain;
	controllerRoutes.localupload = localupload;
	controllerRoutes.decryptAsset = decryptAsset;
	controllerRoutes.createassetfile = createassetfile;
	controllerRoutes.create_asset = create_asset;
	controllerRoutes.assetcreate = assetcreate;
	controllerRoutes.create_assets_from_files = create_assets_from_files;
	controllerRoutes.rename = multiupload_rename;
	controllerRoutes.searchResults = searchResults;
	controllerRoutes.remove = remove;
	controllerRoutes.updateModel = (options) => CoreController.updateModel(Object.assign({ model: Asset }, options));
	controllerRoutes.changeDest = multiupload_changeDest;
	controllerRoutes.onParseStart = multiupload_onParseStart;
	controllerRoutes.client_encryption_algo = client_encryption_algo;
	controllerRoutes.upload_dir = upload_dir;
	controllerRoutes.get_asset_object_from_file = get_asset_object_from_file;
	return controllerRoutes;
};

module.exports = controller;
