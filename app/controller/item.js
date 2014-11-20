'use strict';

var moment = require('moment'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	str2json = require('string-to-json'),
	async = require('async'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	Item,
	Category,
	Tag,
	User,
	Contenttypes,
	logger;

var show = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'item/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.item.title
					},
					item: req.controllerData.item,
					user: req.user
				}
			});
		}
	);
};

var index = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'item/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Articles'
					},
					items: req.controllerData.items,
					itemscount: req.controllerData.itemscount,
					itempages: Math.ceil(req.controllerData.itemscount / req.query.limit),
					user: req.user
				}
			});
		}
	);
};

var create = function (req, res) {
	var newitem = CoreUtilities.removeEmptyObjectValues(req.body);
	newitem.name = (newitem.name) ? newitem.name : CoreUtilities.makeNiceName(newitem.title);
	newitem.itemauthorname = req.user.username;
	newitem.primaryauthor = req.user._id;
	newitem.authors = [req.user._id];
	if (newitem.date && newitem.time) {
		newitem.publishat = new Date(moment(newitem.date + ' ' + newitem.time).format());
	}

	newitem = str2json.convert(newitem);
	newitem.changes= [{
		editor:req.user._id,
		editor_username:req.user.username,
		changeset:{
			title:newitem.title,
			name:newitem.name,
			content:newitem.content,
			
			tags: (newitem.tags && Array.isArray(newitem.tags)) ? newitem.tags: [newitem.tags],
			categories: (newitem.tags && Array.isArray(newitem.categories)) ? newitem.categories: [newitem.categories],
			assets: (newitem.tags && Array.isArray(newitem.assets)) ? newitem.assets: [newitem.assets],
			contenttypes: (newitem.tags && Array.isArray(newitem.contenttypes)) ? newitem.contenttypes: [newitem.contenttypes],

			primaryasset:newitem.primaryasset,
			contenttypeattributes:newitem.contenttypeattributes,
		}
	}];
	CoreController.createModel({
		model: Item,
		newdoc: newitem,
		res: res,
		req: req,
		successredirect: '/p-admin/item/edit/',
		appendid: true
	});
};

var update = function (req, res) {
	var updateitem = (req.skipemptyvaluecheck)? req.body: CoreUtilities.removeEmptyObjectValues(req.body),
		saverevision= (typeof req.saverevision ==='boolean')? req.saverevision : true;

	if(updateitem.title && !updateitem.name){
		updateitem.name = (updateitem.name) ? updateitem.name : CoreUtilities.makeNiceName(updateitem.title);
	}

	if (!updateitem.primaryasset && updateitem.assets && updateitem.assets.length > 0) {
		updateitem.primaryasset = updateitem.assets[0];
	}
	if (updateitem.date && updateitem.time) {
		updateitem.publishat = new Date(moment(updateitem.date + ' ' + updateitem.time).format());
	}
	updateitem = str2json.convert(updateitem);

	CoreController.updateModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: Item,
		id: updateitem.docid,
		updatedoc: updateitem,
		forceupdate: req.forceupdate,
		saverevision: saverevision,
		originalrevision: req.controllerData.item,
		population: 'contenttypes authors',
		res: res,
		req: req,
		successredirect: req.redirectpath ||  '/p-admin/item/edit/',
		appendid: true
	});
};

var remove = function (req, res) {
	var removeitem = req.controllerData.item,
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
			model: Item,
			deleteid: removeitem._id,
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
						redirecturl: '/p-admin/items',
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

var loadFullItemData = function (req, res, err, doc, next, callback) {
	if (err) {
		CoreController.handleDocumentQueryErrorResponse({
			err: err,
			res: res,
			req: req
		});
	}
	else if (doc) {
		req.controllerData.item = doc;
		if (callback) {
			callback(req, res);
		}
		else {
			next();
		}
	}
	else {
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('invalid document request'),
			res: res,
			req: req
		});
	}
};

var loadItem = function (req, res, next) {
	var params = req.params,
		population = 'contenttypes primaryauthor authors',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		population: population,
		model: Item,
		callback: function (err, doc) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (doc) {
				req.controllerData.item = doc;
				next();
			}
			else {
				CoreController.handleDocumentQueryErrorResponse({
					err: new Error('invalid document request'),
					res: res,
					req: req
				});
			}
		}
	});
};

var loadFullItem = function (req, res, next) {
	var params = req.params,
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		model: Item,
		population: 'tags collections contenttypes categories assets primaryasset authors primaryauthor',
		callback: function (err, doc) {
			loadFullItemData(req, res, err, doc, next, null);
		}
	});
};

var loadItemsWithCount = function (req, res, next) {
	req.headers.loaditemcount = true;
	next();
};

var loadItemsWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.itemsperpage || req.query.docsperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getItemsData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.itemsperpage,
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

				parallelTask.itemscount = function(cb){
					if(req.headers.loaditemcount){
						Item.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.itemsquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: Item,
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
							req.controllerData.items = results.itemsquery;
							req.controllerData.itemscount = results.itemscount;
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

var loadItems = function (req, res, next) {
	var query = {},
		population = 'tags categories authors contenttypes assets primaryasset primaryauthor',
		orQuery = [];

	getItemsData({
		req: req,
		res: res,
		next: next,
		population: population,
		query: query,
		orQuery: orQuery
	});
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	Item = mongoose.model('Item');
	Contenttypes = mongoose.model('Contenttype');
	Category = mongoose.model('Category');
	Tag = mongoose.model('Tag');
	User = mongoose.model('User');

	return {
		show: show,
		index: index,
		create: create,
		update: update,
		remove: remove,
		loadFullItemData: loadFullItemData,
		loadItem: loadItem,
		loadFullItem: loadFullItem,
		getItemsData: getItemsData,
		loadItemsWithDefaultLimit: loadItemsWithDefaultLimit,
		loadItemsWithCount:loadItemsWithCount,
		loadItems: loadItems
	};
};

module.exports = controller;