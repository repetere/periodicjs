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
	Compilation,
	Category,
	Tag,
	User,
	Contenttypes,
	logger;

var show = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'compilation/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.compilation.title
					},
					compilation: req.controllerData.compilation,
					user: req.user
				}
			});
		}
	);
};

var index = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'compilation/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Compilations'
					},
					compilations: req.controllerData.compilations,
					compilationscount: req.controllerData.compilationscount,
					compilationpages: Math.ceil(req.controllerData.compilationscount / req.query.limit),
					user: req.user
				}
			});
		}
	);
};

var create = function (req, res) {
	var newcompilation = CoreUtilities.removeEmptyObjectValues(req.body);
	newcompilation.name = (newcompilation.name) ? newcompilation.name : CoreUtilities.makeNiceName(newcompilation.title);
	newcompilation.itemauthorname = req.user.username;
	newcompilation.primaryauthor = req.user._id;
	newcompilation.authors = [req.user._id];
	if (newcompilation.date && newcompilation.time) {
		newcompilation.publishat = new Date(moment(newcompilation.date + ' ' + newcompilation.time).format());
	}

	if (newcompilation.items) {
		for (var x in newcompilation.items) {
			newcompilation.items[x] = JSON.parse(newcompilation.items[x]);
		}
	}

	newcompilation = str2json.convert(newcompilation);
	newcompilation.changes= [{
		editor:req.user._id,
		editor_username:req.user.username,
		changeset:{
			title:newcompilation.title,
			name:newcompilation.name,
			content:newcompilation.content,

			tags: (newcompilation.tags && Array.isArray(newcompilation.tags)) ? newcompilation.tags: [newcompilation.tags],
			categories: (newcompilation.categories && Array.isArray(newcompilation.categories)) ? newcompilation.categories: [newcompilation.categories],
			assets: (newcompilation.assets && Array.isArray(newcompilation.assets)) ? newcompilation.assets: [newcompilation.assets],
			contenttypes: (newcompilation.contenttypes && Array.isArray(newcompilation.contenttypes)) ? newcompilation.contenttypes: [newcompilation.contenttypes],

			primaryasset:newcompilation.primaryasset,
			contenttypeattributes:newcompilation.contenttypeattributes,
		}
	}];

	CoreController.createModel({
		model: Compilation,
		newdoc: newcompilation,
		res: res,
		req: req,
		successredirect: '/p-admin/compilation/edit/',
		appendid: true
	});
};

var update = function (req, res) {
	var updatecompilation = (req.skipemptyvaluecheck)? req.body: CoreUtilities.removeEmptyObjectValues(req.body),
		saverevision= (typeof req.saverevision ==='boolean')? req.saverevision : true;
		// console.log('updatecompilation',updatecompilation);
		if(updatecompilation.title && !updatecompilation.name){
		updatecompilation.name = (updatecompilation.name) ? updatecompilation.name : CoreUtilities.makeNiceName(updatecompilation.title);
		}

	try{
		if (updatecompilation.content_entities && updatecompilation.content_entities.length > 0) {
			for (var x in updatecompilation.content_entities) {
				updatecompilation.content_entities[x] = JSON.parse(updatecompilation.content_entities[x]);
			}
		}
		if (!updatecompilation.primaryasset && updatecompilation.assets && updatecompilation.assets.length > 0) {
			updatecompilation.primaryasset = updatecompilation.assets[0];
		}
		if (updatecompilation.date && updatecompilation.time) {
			updatecompilation.publishat = new Date(moment(updatecompilation.date + ' ' + updatecompilation.time).format());
		}
		updatecompilation = str2json.convert(updatecompilation);
		// console.log('updatecompilation',updatecompilation);

		CoreController.updateModel({
			cached: req.headers.periodicCache !== 'no-periodic-cache',
			model: Compilation,
			id: updatecompilation.docid,
			updatedoc: updatecompilation,
			forceupdate: req.forceupdate,
			originalrevision: req.controllerData.compilation,
			saverevision: saverevision,
			population: 'contenttypes',
			res: res,
			req: req,
			successredirect: req.redirectpath || '/p-admin/compilation/edit/',
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
		model: Compilation,
		id: req.controllerData.compilation._id,
		updatedoc: objectToModify,
		saverevision: true,
		res: res,
		req: req,
		appendArray: true,
		successredirect: '/p-admin/compilation/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var removecompilation = req.controllerData.compilation,
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
			model: Compilation,
			deleteid: removecompilation._id,
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
						redirecturl: '/p-admin/compilations',
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

var loadCompilationData = function (req, res, err, doc, next, callback) {
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
					Compilation.populate(doc,{
						path: 'content_entities.entity_item',
						model: 'Item',
						select: 'title name content dek createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
					},asyncCB);
				},
				populateCollections:function(asyncCB){
					Compilation.populate(doc,{
						path: 'content_entities.entity_collection',
						model: 'Collection',
						select: 'title name content dek createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor '
					},asyncCB);
				}
			},
			function(loadCompilationDataError,loadCompilationDataResults){
				if (loadCompilationDataError) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else{
					async.parallel({
						entity_item_tags: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateItems, {
									path: 'content_entities.entity_item.tags',
									model: 'Tag',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_tags: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateCollections, {
									path: 'content_entities.entity_collection.tags',
									model: 'Tag',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_categories: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateItems, {
									path: 'content_entities.entity_item.categories',
									model: 'Category',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories authors primaryauthor '
								},
								callback);
						},
						entity_collection_categories: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateCollections, {
									path: 'content_entities.entity_collection.categories',
									model: 'Category',
									select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories authors primaryauthor '
								},
								callback);
						},
						entity_item_authors: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateItems, {
									path: 'content_entities.entity_item.authors',
									model: 'User',
									// select: 'firstname name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_primaryauthor: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateItems, {
									path: 'content_entities.entity_item.primaryauthor',
									model: 'User',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_contenttypes: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateItems, {
									path: 'content_entities.entity_item.contenttypes',
									model: 'Contenttype',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_assets: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateItems, {
									path: 'content_entities.entity_item.assets',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_item_primaryasset: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateItems, {
									path: 'content_entities.entity_item.primaryasset',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_authors: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateCollections, {
									path: 'content_entities.entity_collection.authors',
									model: 'User',
									// select: 'firstname name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_primaryauthor: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateCollections, {
									path: 'content_entities.entity_collection.primaryauthor',
									model: 'User',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_contenttypes: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateCollections, {
									path: 'content_entities.entity_collection.contenttypes',
									model: 'Contenttype',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_assets: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateCollections, {
									path: 'content_entities.entity_collection.assets',
									model: 'Asset',
									// select: 'title name content createdat updatedat publishat status contenttypes contenttypeattributes tags categories assets primaryasset authors primaryauthor itemauthorname'
								},
								callback);
						},
						entity_collection_primaryasset: function (callback) {
							Compilation.populate(loadCompilationDataResults.populateCollections, {
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
						else if (loadCompilationDataResults.populateItems || loadCompilationDataResults.populateCollections) {
							// console.log('results.assets', results.assets);
							var mergedCompilationData;
							if(loadCompilationDataResults.populateItems){
								mergedCompilationData = merge(loadCompilationDataResults.populateItems, results.entity_item_tags);
								mergedCompilationData = merge(mergedCompilationData, results.entity_item_assets);
								mergedCompilationData = merge(mergedCompilationData, results.entity_item_primaryauthor);
							}
							if(loadCompilationDataResults.populateCollections){
								mergedCompilationData = merge(loadCompilationDataResults.populateCollections, results.entity_collection_tags);
								mergedCompilationData = merge(mergedCompilationData, results.entity_collection_assets);
								mergedCompilationData = merge(mergedCompilationData, results.entity_collection_primaryauthor);
							}
							req.controllerData.compilation = mergedCompilationData;
							// req.controllerData.compilationData = results;
							if (callback) {
								callback(req, res);
							}
							else {
								next();
							}
						}
						else {
							CoreController.handleDocumentQueryErrorResponse({
								err: new Error('invalid compilation request'),
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

var loadCompilation = function (req, res, next) {
	var params = req.params,
		population = 'tags categories authors assets primaryasset contenttypes primaryauthor content_entities',
		docid = params.id;
	// console.log('params',params);


	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		model: Compilation,
		population: population,
		callback: function (err, doc) {
			loadCompilationData(req, res, err, doc, next, null);
		}
	});
};

var loadCompilationsWithCount = function (req, res, next) {
	req.headers.loadcompilationcount = true;
	next();
};

var loadCompilationsWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.compilationsperpage || req.query.docsperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getCompilationsData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.compilationsperpage,
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

				parallelTask.compilationscount = function(cb){
					if(req.headers.loadcompilationcount){
						Compilation.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.compilationsquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: Compilation,
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
							req.controllerData.compilations = results.compilationsquery;
							req.controllerData.compilationscount = results.compilationscount;
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

var loadCompilations = function (req, res, next) {
	var query = {},
		population = 'tags categories authors contenttypes primaryauthor primaryasset assets content_entities.entity_item content_entities.entity_collection',
		orQuery = [];

	getCompilationsData({
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
		// var Compilation = mongoose.model('Compilation');
		// Compilation.find({}).limit(2).exec(function(err,items){ 
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
		// Compilation.find(query).limit(5).populate(population).exec(function(err,docs){
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
			model: Compilation,
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
	Compilation = mongoose.model('Compilation');
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
		loadCompilationData: loadCompilationData,
		loadCompilation: loadCompilation,
		getCompilationsData: getCompilationsData,
		loadCompilationsWithDefaultLimit: loadCompilationsWithDefaultLimit,
		loadCompilationsWithCount:loadCompilationsWithCount,
		loadCompilations: loadCompilations
	};
};

module.exports = controller;
