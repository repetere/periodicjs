'use strict';
var path = require('path'),
	// async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	themeController,
	Compilation,
	compilationController,
	Collection,
	collectionController,
	Item,
	itemController,
	appSettings,
	appThemeEnvSettings,
	mongoose,
	logger;


var loadNavCategories = function(req,res,next){
	themeController.customLayout({
		req: req,
		res: res,
		next: next,
		viewpath: 'home/index',
		layoutdatavarname: 'navdata',
		layoutdata: {
			categories: {
				model: 'Category',
				search: {
					query: req.params.cat,
					sort: 'title',
					limit: 100,
					offset: 0
				}
			}
		}
	});
};

var getNavCategories = function(req,res,next){
	res.locals.navdata = req.controllerData.navdata;
	next();
};

var homepageindex = function(req,res){
	req.controllerData = (req.controllerData) ? req.controllerData : {};

	var homepagedocs = [],
		sortedHomepageDocs =[],
		homepageitems = req.controllerData.layoutdata.items,
		homepagecollections = req.controllerData.layoutdata.collections,
		homepagecompilations = req.controllerData.layoutdata.compilations;
	homepagedocs = homepagedocs.concat(homepagecompilations,homepagecollections,homepageitems);

	sortedHomepageDocs = homepagedocs.sort(CoreUtilities.sortObject('desc', 'publishat'));

	CoreController.getPluginViewDefaultTemplate({
				viewname: 'home/index',
				themefileext: appSettings.templatefileextension
			},
			function (err, templatepath) {
				CoreController.handleDocumentQueryRender({
					res: res,
					req: req,
					renderView: templatepath,
					responseData: {
						pagedata: {
							title: 'Welcome'
						},
						homepagedocs: sortedHomepageDocs,
						user: req.user
					}
				});
			}
		);
};

var defaulthomepage = function(req,res,next){
	themeController.customLayout({
			req: req,
			res: res,
			next: next,
			viewpath: 'home/index',
			layoutdata: {
				items: {
					model: 'Item',
					search: {
						customquery: {'collectionitemonly':false},
						sort: '-publishat',
						limit: 5,
						offset: 0,
						population: 'authors primaryauthor contenttypes primaryasset tags primaryauthor assets categories '
					}
				},
				collections: {
					model: 'Collection',
					search: {
						query: req.params.item,
						sort: '-publishat',
						limit: 5,
						offset: 0,
						population: 'tags categories authors assets primaryasset contenttypes primaryauthor items items.item'
					}
				},
				compilations: {
					model: 'Compilation',
					search: {
						query: req.params.item,
						sort: '-publishat',
						limit: 5,
						offset: 0,
						population: 'tags categories authors assets primaryasset contenttypes primaryauthor content_entities content_entities.entity_item content_entities.entity_collection content_entities.entity_collection.items.item'
					}
				},
			}
		});
};

var homepagedata = function(req,res,next){
	if(appSettings.themeSettings && appThemeEnvSettings){
		req.params.id = appThemeEnvSettings['homepage-value'];
		req.controllerData = (req.controllerData) ? req.controllerData : {};
		var params = req.params,
			docid,
			population;

		switch(appThemeEnvSettings.homepage){
			case 'item':
				population = 'tags collections contenttypes categories assets primaryasset authors primaryauthor';
				docid = params.id;

				CoreController.loadModel({
					docid: docid,
					model: Item,
					population: population,
					callback: function (err, doc) {
						itemController.loadFullItemData(req, res, err, doc, null, itemController.show);
					}
				});	
				break;
			case 'collection':
				population = 'tags categories authors assets primaryasset contenttypes primaryauthor items';
					docid = params.id;

				CoreController.loadModel({
					docid: docid,
					model: Collection,
					population: population,
					callback: function (err, doc) {
						collectionController.loadCollectionData(req, res, err, doc, null, collectionController.show);
					}
				});			
				break;
			case 'compilation':
				population = 'tags categories authors assets primaryasset contenttypes primaryauthor content_entities';
					docid = params.id;

				CoreController.loadModel({
					docid: docid,
					model: Compilation,
					population: population,
					callback: function (err, doc) {
						loadCompilationData(req, res, err, doc, next, null);
					}
				});
				break;
			default:
				defaulthomepage(req,res,next);
				break;
		}
	}
	else{
		defaulthomepage(req,res,next);
	}
};

var setCacheHeader = function(req,res,next){
	var httpPathName = req._parsedUrl.pathname;
	if(appSettings.themeSettings && appThemeEnvSettings){
		switch(true){
			case (/p-admin\//gi.test(httpPathName)):
				logger.silly('no cache on admin');
				break;
			case httpPathName==='/':
				logger.silly('using home cache headers');
				res.header('Cache-Control', appThemeEnvSettings['home cache control settings']);
				break;
			case httpPathName==='/items' || (/item\//gi.test(httpPathName)):
				logger.silly('using item cache headers');
				res.header('Cache-Control', appThemeEnvSettings['item cache control settings']);
				break;
			case httpPathName==='/collections' || (/collection\//gi.test(httpPathName)):
				logger.silly('using collection cache headers');
				res.header('Cache-Control', appThemeEnvSettings['collection cache control settings']);
				break;
			case httpPathName==='/browse' || (/browse\//gi.test(httpPathName)):
				logger.silly('using browse cache headers');
				res.header('Cache-Control', appThemeEnvSettings['browse cache control settings']);
				break;
			default:
				logger.silly('using default cache headers');
				res.header('Cache-Control', appThemeEnvSettings['default cache control settings']);
				break;
		}
	}
	next();
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	themeController = require(path.join(process.cwd(), 'app/controller/theme'))(resources);
	Item = mongoose.model('Item');
	itemController = require(path.resolve(process.cwd(), './app/controller/item'))(resources);
	Collection = mongoose.model('Collection');
	collectionController = require(path.resolve(process.cwd(), './app/controller/collection'))(resources);
	Compilation = mongoose.model('Compilation');
	compilationController = require(path.resolve(process.cwd(), './app/controller/compilation'))(resources);
	if(appSettings.themeSettings && appSettings.themeSettings.settings){
		appThemeEnvSettings = appSettings.themeSettings.settings[appSettings.application.environment];
	}

	return {
		homepagedata: homepagedata,
		homepageindex:homepageindex,
		setCacheHeader: setCacheHeader,
		loadNavCategories: loadNavCategories,
		getNavCategories: getNavCategories
	};
};

module.exports = controller;