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
	Category,
	Tag,
	User,
	Contenttypes,
	logger;

var show = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'collection/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.collection.title
					},
					collection: req.controllerData.collection,
					user: req.user
				}
			});
		}
	);
};

var index = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'collection/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Collections'
					},
					collections: req.controllerData.collections,
					collectionscount: req.controllerData.collectionscount,
					collectionpages: Math.ceil(req.controllerData.collectionscount / req.query.limit),
					user: req.user
				}
			});
		}
	);
};

var create = function (req, res) {
	var newcollection = CoreUtilities.removeEmptyObjectValues(req.body);
	newcollection.name = (newcollection.name) ? newcollection.name : CoreUtilities.makeNiceName(newcollection.title);
	newcollection.itemauthorname = req.user.username;
	newcollection.primaryauthor = req.user._id;
	newcollection.authors = [req.user._id];
	if (newcollection.date && newcollection.time) {
		newcollection.publishat = new Date(moment(newcollection.date + ' ' + newcollection.time).format());
	}

	if (newcollection.items) {
		for (var x in newcollection.items) {
			newcollection.items[x] = JSON.parse(newcollection.items[x]);
		}
	}

	newcollection = str2json.convert(newcollection);
	newcollection.changes= [{
		editor:req.user._id,
		editor_username:req.user.username,
		changeset:{
			title: newcollection.title,
			name: newcollection.name,
			content: newcollection.content,
			tags: (newcollection.tags && Array.isArray(newcollection.tags)) ? newcollection.tags: [newcollection.tags],
			categories: (newcollection.categories && Array.isArray(newcollection.categories)) ? newcollection.categories: [newcollection.categories],
			assets: (newcollection.assets && Array.isArray(newcollection.assets)) ? newcollection.assets: [newcollection.assets],
			contenttypes: (newcollection.contenttypes && Array.isArray(newcollection.contenttypes)) ? newcollection.contenttypes: [newcollection.contenttypes],
			primaryasset: newcollection.primaryasset,
			contenttypeattributes: newcollection.contenttypeattributes,
		}
	}];

	CoreController.createModel({
		model: Collection,
		newdoc: newcollection,
		res: res,
		req: req,
		successredirect: '/p-admin/collection/edit/',
		appendid: true
	});
};

var update = function (req, res) {
	var updatecollection = (req.skipemptyvaluecheck)? req.body: CoreUtilities.removeEmptyObjectValues(req.body),
		saverevision= (typeof req.saverevision ==='boolean')? req.saverevision : true;

	if(updatecollection.title && !updatecollection.name){
		updatecollection.name = (updatecollection.name) ? updatecollection.name : CoreUtilities.makeNiceName(updatecollection.title);
	}
	try{
		if (updatecollection.items && updatecollection.items.length > 0) {
			for (var x in updatecollection.items) {
				updatecollection.items[x] = JSON.parse(updatecollection.items[x]);
			}
		}
		if (!updatecollection.primaryasset && updatecollection.assets && updatecollection.assets.length > 0) {
			updatecollection.primaryasset = updatecollection.assets[0];
		}
		if (updatecollection.date && updatecollection.time) {
			updatecollection.publishat = new Date(moment(updatecollection.date + ' ' + updatecollection.time).format());
		}
		updatecollection = str2json.convert(updatecollection);

		CoreController.updateModel({
			cached: req.headers.periodicCache !== 'no-periodic-cache',
			model: Collection,
			id: updatecollection.docid,
			updatedoc: updatecollection,
			forceupdate: req.forceupdate,
			saverevision: saverevision,
			originalrevision: req.controllerData.collection,
			population: 'contenttypes primaryasset assets primaryauthor authors',
			res: res,
			req: req,
			successredirect: req.redirectpath || '/p-admin/collection/edit/',
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
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: Collection,
		id: req.controllerData.collection._id,
		updatedoc: objectToModify,
		saverevision: true,
		res: res,
		req: req,
		appendArray: true,
		successredirect: '/p-admin/collection/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var removecollection = req.controllerData.collection,
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
			cached: req.headers.periodicCache !== 'no-periodic-cache',
			model: Collection,
			deleteid: removecollection._id,
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
						redirecturl: '/p-admin/collections',
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

var loadCollectionData = function (req, res, err, doc, next, callback) {
	{
		if (err) {
			CoreController.handleDocumentQueryErrorResponse({
				err: err,
				res: res,
				req: req
			});
		}
		else {
			Collection.populate(doc, {
				path: 'items.item',
				model: 'Item',
				select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
			}, function (err, populatedcollection) {
				if (err) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else {
					// console.log('doc',populatedcollection);
					async.parallel({
						tags: function (callback) {
							Collection.populate(populatedcollection, {
									path: 'items.item.tags',
									model: 'Tag',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						categories: function (callback) {
							Collection.populate(populatedcollection, {
									path: 'items.item.categories',
									model: 'Category',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories authors primaryauthor '
								},
								callback);
						},
						authors: function (callback) {
							Collection.populate(populatedcollection, {
									path: 'items.item.authors',
									model: 'User',
									// select: 'firstname name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						primaryauthor: function (callback) {
							Collection.populate(populatedcollection, {
									path: 'items.item.primaryauthor',
									model: 'User',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						contenttypes: function (callback) {
							Collection.populate(populatedcollection, {
									path: 'items.item.contenttypes',
									model: 'Contenttype',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						assets: function (callback) {
							Collection.populate(populatedcollection, {
									path: 'items.item.assets',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						primaryasset: function (callback) {
							Collection.populate(populatedcollection, {
									path: 'items.item.primaryasset',
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
						else if (populatedcollection) {
							// console.log('results.assets', results.assets);
							var mergedCollectionData = merge(populatedcollection, results.tags);
							mergedCollectionData = merge(mergedCollectionData, results.assets);
							mergedCollectionData = merge(mergedCollectionData, results.primaryauthor);
							req.controllerData.collection = mergedCollectionData;
							// req.controllerData.collectionData = results;
							if (callback) {
								callback(req, res);
							}
							else {
								next();
							}
						}
						else {
							CoreController.handleDocumentQueryErrorResponse({
								err: new Error('invalid collection request'),
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

var loadCollection = function (req, res, next) {
	var params = req.params,
		population = 'tags categories authors assets primaryasset contenttypes primaryauthor items',
		docid = params.id;
	// console.log('params',params);


	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		model: Collection,
		population: population,
		callback: function (err, doc) {
			loadCollectionData(req, res, err, doc, next, null);
		}
	});
};

var loadCollectionsWithCount = function (req, res, next) {
	req.headers.loadcollectioncount = true;
	next();
};

var loadCollectionsWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.collectionsperpage || req.query.docsperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getCollectionsData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.collectionsperpage,
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

				parallelTask.collectionscount = function(cb){
					if(req.headers.loadcollectioncount){
						Collection.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.collectionsquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: Collection,
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
							req.controllerData.collections = results.collectionsquery;
							req.controllerData.collectionscount = results.collectionscount;
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

var loadCollections = function (req, res, next) {
	var query = {},
		population = 'tags categories authors contenttypes assets primaryauthor primaryasset items.item',
		orQuery = [];

	getCollectionsData({
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
		// var Collection = mongoose.model('Collection');
		// Collection.find({}).limit(2).exec(function(err,items){ 
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
		// Collection.find(query).limit(5).populate(population).exec(function(err,docs){
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
			cached: false,
			model: Collection,
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
		loadCollectionData: loadCollectionData,
		loadCollection: loadCollection,
		getCollectionsData: getCollectionsData,
		loadCollectionsWithDefaultLimit: loadCollectionsWithDefaultLimit,
		loadCollectionsWithCount:loadCollectionsWithCount,
		loadCollections: loadCollections
	};
};

module.exports = controller;
