'use strict';

var async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	logger,
	Item, Collection, Compilation, User, Contenttype, Category, Tag;

var results = function (req, res) {
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
					docs: req.controllerData.searchdocuments,
					user: CoreUtilities.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var index = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'browse/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'Browse'
					},
					docs: req.controllerData.searchdocuments,
					tags: req.controllerData.browsetags,
					user: req.user
				}
			});
		}
	);
};

var browse = function (req, res, next) {
	var query = {},
		searchdocuments,
		params = req.params,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// selection = 'title content tags.title tags.name categories.title categories.name authors.username contenttypes primaryasset primaryauthor.username',
		population = 'tags categories authors contenttypes items.item content_entities.entity_item content_entities.entity_collection assets primaryasset primaryauthor';
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	if (params.entitytype) {
		switch (params.entitytype) {
		case 'authors':
			query = {
				$or: [{
					'primaryauthor': {
						$in: req.controllerData.filteridarray
					}
				}, {
					'authors': {
						$in: req.controllerData.filteridarray
					}
				}]
			};
			break;
		case 'categories':
			query = {
				'categories': {
					$in: req.controllerData.filteridarray
				}
			};
			break;
		case 'tags':
			query = {
				'tags': {
					$in: req.controllerData.filteridarray
				}
			};
			break;
		case 'contenttypes':
			query = {
				'contenttypes': {
					$in: req.controllerData.filteridarray
				}
			};
			break;
		default:
			next(new Error('Invalid Entity Type'));
			break;
		}
	}
	else {
		var searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi');
		if (req.query.search === undefined || req.query.search.length < 1) {
			query = {};
		}
		else {
			query = {
				$or: [{
					title: searchRegEx
				}, {
					'name': searchRegEx
				}, {
					'content': searchRegEx
				}]
			};
		}
	}

	async.parallel({
		searchCompilations: function (callback) {
			CoreController.searchModel({
				cached: req.headers.periodicCache !== 'no-periodic-cache',
				model: Compilation,
				query: query,
				sort: sort,
				limit: limit,
				offset: offset,
				// selection:selection,
				population: population,
				callback: callback
			});
		},
		searchCollections: function (callback) {
			CoreController.searchModel({
				cached: req.headers.periodicCache !== 'no-periodic-cache',
				model: Collection,
				query: query,
				sort: sort,
				limit: limit,
				offset: offset,
				// selection:selection,
				population: population,
				callback: callback
			});
		},
		searchDocuments: function (callback) {
			CoreController.searchModel({
				cached: req.headers.periodicCache !== 'no-periodic-cache',
				model: Item,
				query: query,
				sort: sort,
				limit: limit,
				offset: offset,
				// selection:selection,
				population: population,
				callback: callback
			});
		}
	}, function (err, results) {
		if (err) {
			next(err);
		}
		else {
			searchdocuments = results.searchDocuments.concat(results.searchCollections);
			req.controllerData.searchdocuments = searchdocuments.sort(CoreUtilities.sortObject('desc', 'createdat'));
			next();
		}
	});
};

var queryFilters = function (options, callback) {
	var model = options.model,
		namesarray = options.namesarray,
		nameval = options.nameval,
		query = {};
	if (namesarray.length < 1) {
		query = {};
	}
	else if (nameval && nameval === 'username') {
		query = {
			'username': {
				$in: namesarray
			}
		};
	}
	else {
		query = {
			'name': {
				$in: namesarray
			}
		};
	}
	model.find(query, '_id name username', callback);
};

var browsefilter = function (req, res, next) {
	var params = req.params,
		namesarray = (params.entityitems) ? params.entityitems.split(',') : [],
		filterIdArray = [],
		defaultResponseFunction = function (err, filterdocs, req, next) {
			if (err) {
				next(err);
			}
			else {
				for (var x in filterdocs) {
					filterIdArray.push(filterdocs[x]._id);
				}
				req.controllerData.filteridarray = filterIdArray;
				next();
			}
		};

	req.controllerData = (req.controllerData) ? req.controllerData : {};
	switch (params.entitytype) {
	case 'authors':
		queryFilters({
			model: User,
			nameval: 'username',
			namesarray: namesarray
		}, function (err, filterdocs) {
			defaultResponseFunction(err, filterdocs, req, next);
		});
		break;
	case 'categories':
		queryFilters({
			model: Category,
			nameval: 'name',
			namesarray: namesarray
		}, function (err, filterdocs) {
			defaultResponseFunction(err, filterdocs, req, next);
		});
		break;
	case 'tags':
		queryFilters({
			model: Tag,
			nameval: 'name',
			namesarray: namesarray
		}, function (err, filterdocs) {
			defaultResponseFunction(err, filterdocs, req, next);
		});
		break;
	case 'contenttypes':
		queryFilters({
			model: Contenttype,
			nameval: 'name',
			namesarray: namesarray
		}, function (err, filterdocs) {
			defaultResponseFunction(err, filterdocs, req, next);
		});
		break;
	default:
		next(new Error('Invalid Entity Type'));
		break;
	}
};

var browsetags = function (req, res, next) {
	var params = req.params,
		offset = req.query.offset,
		query = {},
		sort = req.query.sort,
		limit = req.query.limit,
		searchFunction = function (options
			//, callback
		) {
			var model = options.model,
				selection = options.selection;
			CoreController.searchModel({
				cached: req.headers.periodicCache !== 'no-periodic-cache',
				model: model,
				query: query,
				sort: sort,
				limit: limit,
				offset: offset,
				selection: selection,
				callback: function (err, tags) {
					if (err) {
						next(err);
					}
					else {
						req.controllerData.browsetags = tags;
						next();
					}
				}
			});
		};
	req.controllerData = (req.controllerData) ? req.controllerData : {};
	switch (params.entitytype) {
	case 'authors':
		searchFunction({
			model: User,
			selection: 'firstname lastname username _id'
		});
		break;
	case 'categories':
		searchFunction({
			model: Category,
			selection: 'name title _id'
		});
		break;
	case 'tags':
		searchFunction({
			model: Tag,
			selection: 'name title _id'
		});
		break;
	case 'contenttypes':
		searchFunction({
			model: Contenttype,
			selection: 'name title _id'
		});
		break;
	default:
		next(new Error('Invalid Entity Type'));
		break;
	}
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	Category = mongoose.model('Category');
	Collection = mongoose.model('Collection');
	Compilation = mongoose.model('Compilation');
	Contenttype = mongoose.model('Contenttype');
	Item = mongoose.model('Item');
	Tag = mongoose.model('Tag');
	User = mongoose.model('User');

	return {
		results: results,
		browse: browse,
		index: index,
		browsefilter: browsefilter,
		browsetags: browsetags
	};
};

module.exports = controller;
