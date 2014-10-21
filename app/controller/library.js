'use strict';

var async = require('async'),
	moment = require('moment'),
	merge = require('utils-merge'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	str2json = require('string-to-json'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Item,
	Collection,
	Library,
	Category,
	Tag,
	User,
	Contenttypes,
	logger;

var show = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'library/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.library.title
					},
					library: req.controllerData.library,
					user: req.user
				}
			});
		}
	);
};

var index = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'library/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Libraries'
					},
					libraries: req.controllerData.libraries,
					user: req.user
				}
			});
		}
	);
};

var create = function (req, res) {
	var newlibrary = CoreUtilities.removeEmptyObjectValues(req.body);
	newlibrary.name = (newlibrary.name) ? newlibrary.name : CoreUtilities.makeNiceName(newlibrary.title);
	newlibrary.itemauthorname = req.user.username;
	newlibrary.primaryauthor = req.user._id;
	newlibrary.authors = [req.user._id];
	if (newlibrary.date && newlibrary.time) {
		newlibrary.publishat = new Date(moment(newlibrary.date + ' ' + newlibrary.time).format());
	}

	if (newlibrary.items) {
		for (var x in newlibrary.items) {
			newlibrary.items[x] = JSON.parse(newlibrary.items[x]);
		}
	}

	newlibrary = str2json.convert(newlibrary);

	CoreController.createModel({
		model: Library,
		newdoc: newlibrary,
		res: res,
		req: req,
		successredirect: '/p-admin/library/edit/',
		appendid: true
	});
};

var update = function (req, res) {
	var updatelibrary = CoreUtilities.removeEmptyObjectValues(req.body);
	updatelibrary.name = (updatelibrary.name) ? updatelibrary.name : CoreUtilities.makeNiceName(updatelibrary.title);
	try{

		if (updatelibrary.content_entities && updatelibrary.content_entities.length > 0) {
			for (var x in updatelibrary.content_entities) {
				// console.log('x',x,'updatelibrary.content_entities[x]',updatelibrary.content_entities[x]);
				updatelibrary.content_entities[x] = JSON.parse(updatelibrary.content_entities[x]);
			}
		}
		if (!updatelibrary.primaryasset && updatelibrary.assets && updatelibrary.assets.length > 0) {
			updatelibrary.primaryasset = updatelibrary.assets[0];
		}
		if (updatelibrary.date && updatelibrary.time) {
			updatelibrary.publishat = new Date(moment(updatelibrary.date + ' ' + updatelibrary.time).format());
		}
		updatelibrary = str2json.convert(updatelibrary);
		// console.log('updatelibrary',updatelibrary);

		CoreController.updateModel({
			model: Library,
			id: updatelibrary.docid,
			updatedoc: updatelibrary,
			saverevision: true,
			population: 'contenttypes',
			res: res,
			req: req,
			successredirect: '/p-admin/library/edit/',
			appendid: true
		});
	}
	catch(e){
		CoreController.handleDocumentQueryErrorResponse({
			err: e,
			res: res,
			req: req
		});
	}
};

var append = function (req, res) {
	var newitemtoadd = CoreUtilities.removeEmptyObjectValues(req.body);
	delete newitemtoadd._csrf;
	var objectToModify = newitemtoadd; //{'items':newitemtoadd};

	logger.silly('objectToModify', objectToModify);
	CoreController.updateModel({
		model: Library,
		id: req.controllerData.library._id,
		updatedoc: objectToModify,
		saverevision: true,
		res: res,
		req: req,
		appendArray: true,
		successredirect: '/p-admin/library/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var removelibrary = req.controllerData.library,
		User = mongoose.model('User');

	if (!User.hasPrivilege(req.user, 710)) {
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('EXT-UAC710: You don\'t have access to modify content'),
			res: res,
			req: req
		});
	}
	else {
		CoreController.deleteModel({
			model: Library,
			deleteid: removelibrary._id,
			req: req,
			res: res,
			callback: function (err) {
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
						redirecturl: '/p-admin/libraries',
						responseData: {
							result: 'success',
							data: 'deleted'
						}
					});
				}
			}
		});
	}
};

var loadLibraryData = function (req, res, err, doc, next, callback) {
	{
		// var populationerror;
		if (err) {
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
		else {
			async.parallel({
				populateItems:function(asyncCB){
					Library.populate(doc,{
						path: 'content_entities.entity_item',
						model: 'Item',
						select: 'title name content dek createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
					},asyncCB);
				},
				populateCollections:function(asyncCB){
					Library.populate(doc,{
						path: 'content_entities.entity_collection',
						model: 'Collection',
						select: 'title name content dek createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor '
					},asyncCB);
				}
			},
			function(loadLibraryDataError,loadLibraryDataResults){
				if (loadLibraryDataError) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else{
					async.parallel({
						entity_item_tags: function (callback) {
							Library.populate(loadLibraryDataResults.populateItems, {
									path: 'content_entities.entity_item.tags',
									model: 'Tag',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_tags: function (callback) {
							Library.populate(loadLibraryDataResults.populateCollections, {
									path: 'content_entities.entity_collection.tags',
									model: 'Tag',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_categories: function (callback) {
							Library.populate(loadLibraryDataResults.populateItems, {
									path: 'content_entities.entity_item.categories',
									model: 'Category',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories authors primaryauthor '
								},
								callback);
						},
						entity_collection_categories: function (callback) {
							Library.populate(loadLibraryDataResults.populateCollections, {
									path: 'content_entities.entity_collection.categories',
									model: 'Category',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories authors primaryauthor '
								},
								callback);
						},
						entity_item_authors: function (callback) {
							Library.populate(loadLibraryDataResults.populateItems, {
									path: 'content_entities.entity_item.authors',
									model: 'User',
									// select: 'firstname name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_primaryauthor: function (callback) {
							Library.populate(loadLibraryDataResults.populateItems, {
									path: 'content_entities.entity_item.primaryauthor',
									model: 'User',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_contenttypes: function (callback) {
							Library.populate(loadLibraryDataResults.populateItems, {
									path: 'content_entities.entity_item.contenttypes',
									model: 'Contenttype',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_assets: function (callback) {
							Library.populate(loadLibraryDataResults.populateItems, {
									path: 'content_entities.entity_item.assets',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_primaryasset: function (callback) {
							Library.populate(loadLibraryDataResults.populateItems, {
									path: 'content_entities.entity_item.primaryasset',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_authors: function (callback) {
							Library.populate(loadLibraryDataResults.populateCollections, {
									path: 'content_entities.entity_collection.authors',
									model: 'User',
									// select: 'firstname name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_primaryauthor: function (callback) {
							Library.populate(loadLibraryDataResults.populateCollections, {
									path: 'content_entities.entity_collection.primaryauthor',
									model: 'User',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_contenttypes: function (callback) {
							Library.populate(loadLibraryDataResults.populateCollections, {
									path: 'content_entities.entity_collection.contenttypes',
									model: 'Contenttype',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_assets: function (callback) {
							Library.populate(loadLibraryDataResults.populateCollections, {
									path: 'content_entities.entity_collection.assets',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_primaryasset: function (callback) {
							Library.populate(loadLibraryDataResults.populateCollections, {
									path: 'content_entities.entity_collection.primaryasset',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						}
					}, function (err, results) {
						if (err) {
							CoreController.handleDocumentQueryErrorResponse({
								err: err,
								res: res,
								req: req
							});
						}
						else if (loadLibraryDataResults.populateItems || loadLibraryDataResults.populateCollections) {
							// console.log('results.assets', results.assets);
							var mergedLibraryData;
							if(loadLibraryDataResults.populateItems){
								mergedLibraryData = merge(loadLibraryDataResults.populateItems, results.entity_item_tags);
								mergedLibraryData = merge(mergedLibraryData, results.entity_item_assets);
								mergedLibraryData = merge(mergedLibraryData, results.entity_item_primaryauthor);
							}
							if(loadLibraryDataResults.populateCollections){
								mergedLibraryData = merge(loadLibraryDataResults.populateCollections, results.entity_collection_tags);
								mergedLibraryData = merge(mergedLibraryData, results.entity_collection_assets);
								mergedLibraryData = merge(mergedLibraryData, results.entity_collection_primaryauthor);
							}
							req.controllerData.library = mergedLibraryData;
							// req.controllerData.libraryData = results;
							if (callback) {
								callback(req, res);
							}
							else {
								next();
							}
						}
						else {
							CoreController.handleDocumentQueryErrorResponse({
								err: new Error('invalid library request'),
								res: res,
								req: req
							});
						}
						// console.log('results',results.tags.items[0].item);
					});
				}
			});
		}
	}
};

var loadLibrary = function (req, res, next) {
	var params = req.params,
		population = 'tags categories authors assets primaryasset contenttypes primaryauthor content_entities',
		docid = params.id;
	// console.log('params',params);


	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		docid: docid,
		model: Library,
		population: population,
		callback: function (err, doc) {
			loadLibraryData(req, res, err, doc, next, null);
		}
	});
};

var loadLibrariesWithCount = function (req, res, next) {
	req.headers.loadlibrarycount = true;
	next();
};

var loadLibrariesWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.librariesperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getLibrariesData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.librariesperpage,
		offset = req.query.offset || (pagenum*limit),
		population = options.population,
		orQuery = options.orQuery,
		searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi'),
		parallelFilterTask = {};

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	if (req.query.search !== undefined && req.query.search.length > 0) {
		orQuery.push({
			title: searchRegEx
		}, {
			'name': searchRegEx
		});
	}

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
	parallelFilterTask.categories = function(cb){
		if(req.query.filter_categories){
			var categoriesArray = (typeof req.query.filter_categories==='string') ? req.query.filter_categories.split(',') : req.query.filter_categories;

			Category.find({'name':{$in:categoriesArray}},'_id', function( err, categoryids){
				cb(err, categoryids);
			});
		}
		else{
			cb(null,null);
		}
	};
	parallelFilterTask.tags = function(cb){
		if(req.query.filter_tags){
			var tagsArray = (typeof req.query.filter_tags==='string') ? req.query.filter_tags.split(',') : req.query.filter_tags;

			Tag.find({'name':{$in:tagsArray}},'_id', function( err, tagids){
				cb(err, tagids);
			});
		}
		else{
			cb(null,null);
		}
	};
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
				// console.log('filters',filters);
				if(filters.contenttypes){
					var ctarray =[];
					for(var z in filters.contenttypes){
						ctarray.push(filters.contenttypes[z]._id);
					}
					// console.log('ctarray',ctarray);
					orQuery.push({'contenttypes':{$in:ctarray}});
				}
				if(filters.categories){
					var catarray =[];
					for(var y in filters.categories){
						catarray.push(filters.categories[y]._id);
					}
					// console.log('ctarray',ctarray);
					orQuery.push({'categories':{$in:catarray}});
				}
				if(filters.tags){
					var tarray =[];
					for(var x in filters.tags){
						tarray.push(filters.tags[x]._id);
					}
					// console.log('ctarray',ctarray);
					orQuery.push({'tags':{$in:tarray}});
				}
				if(filters.authors){
					var aarray =[];
					for(var w in filters.authors){
						aarray.push(filters.authors[w]._id);
					}
					// console.log('ctarray',ctarray);
					orQuery.push({'authors':{$in:aarray}});
				}

				if(orQuery.length>0){
					query = {
						$and: orQuery
					};
				}

				parallelTask.librariescount = function(cb){
					if(req.headers.loadlibrarycount){
						Library.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.librariesquery = function(cb){
					CoreController.searchModel({
						model: Library,
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
							req.controllerData.libraries = results.librariesquery;
							req.controllerData.librariescount = results.librariescount;
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

var loadLibraries = function (req, res, next) {
	var query = {},
		population = 'tags categories authors contenttypes primaryauthor primaryasset content_entities.entity_item content_entities.entity_collection',
		orQuery = [];

	getLibrariesData({
		req: req,
		res: res,
		next: next,
		population: population,
		query: query,
		orQuery: orQuery
	});
};

var cli = function (argv) {
	if (argv.search) {
		// var Library = mongoose.model('Library');
		// Library.find({}).limit(2).exec(function(err,items){ 
		// 	if(err){ console.error(err); } else{ console.info(items); }
		// 	process.exit(0);
		// });
		var query,
			offset = argv.offset,
			sort = argv.sort,
			limit = argv.limit,
			population = 'tags categories authors contenttypes primaryauthor items.item',
			searchRegEx = new RegExp(CoreUtilities.stripTags(argv.search), 'gi');

		if (argv.search === undefined || argv.search.length < 1) {
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
		// Library.find(query).limit(5).populate(population).exec(function(err,docs){
		// 		console.log('in model search cb');
		// 		if(err){
		// 			console.log(err);
		// 			process.exit(0);
		// 		}
		// 		else{
		// 			console.log('got docs');
		// 			console.info(docs);
		// 			process.exit(0);
		// 		}
		// 	});
		CoreController.searchModel({
			model: Library,
			query: query,
			sort: sort,
			limit: limit,
			offset: offset,
			population: population,
			callback: function (err, docs) {
				console.log('in model search cb');
				if (err) {
					console.log(err);
					process.exit(0);
				}
				else {
					console.log('got docs');
					console.info(docs);
					process.exit(0);
				}
			}
		});
	}
	else {
		logger.silly('invalid task');
		process.exit(0);
	}
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	Item = mongoose.model('Item');
	Collection = mongoose.model('Collection');
	Library = mongoose.model('Library');
	Contenttypes = mongoose.model('Contenttype');
	Category = mongoose.model('Category');
	Tag = mongoose.model('Tag');
	User = mongoose.model('User');

	return {
		show: show,
		index: index,
		create: create,
		remove: remove,
		update: update,
		append: append,
		cli: cli,
		loadLibraryData: loadLibraryData,
		loadLibrary: loadLibrary,
		getLibrariesData: getLibrariesData,
		loadLibrariesWithDefaultLimit: loadLibrariesWithDefaultLimit,
		loadLibrariesWithCount:loadLibrariesWithCount,
		loadLibraries: loadLibraries
	};
};

module.exports = controller;
