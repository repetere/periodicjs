'use strict';

var async = require('async'),
	moment = require('moment'),
	merge = require('utils-merge'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	str2json = require('string-to-json'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Item,
	Collection,
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
	var updatecollection = CoreUtilities.removeEmptyObjectValues(req.body);
	updatecollection.name = (updatecollection.name) ? updatecollection.name : CoreUtilities.makeNiceName(updatecollection.title);
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
		model: Collection,
		id: updatecollection.docid,
		updatedoc: updatecollection,
		saverevision: true,
		population: 'contenttypes',
		res: res,
		req: req,
		successredirect: '/p-admin/collection/edit/',
		appendid: true
	});
};

var append = function (req, res) {
	var newitemtoadd = CoreUtilities.removeEmptyObjectValues(req.body);
	delete newitemtoadd._csrf;
	var objectToModify = newitemtoadd; //{'items':newitemtoadd};

	logger.silly('objectToModify', objectToModify);
	CoreController.updateModel({
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
		docid: docid,
		model: Collection,
		population: population,
		callback: function (err, doc) {
			loadCollectionData(req, res, err, doc, next, null);
		}
	});
};

var loadCollections = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		population = 'tags categories authors contenttypes primaryauthor primaryasset items.item',
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
		model: Collection,
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
				req.controllerData.collections = documents;
				next();
			}
		}
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
		loadCollections: loadCollections
	};
};

module.exports = controller;
