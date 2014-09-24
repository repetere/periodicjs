'use strict';
var path = require('path'),
	// async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	CoreUtilities,
	CoreController,
	themeController,
	Collection,
	collectionController,
	Item,
	itemController,
	appSettings,
	mongoose,
	logger;

var defaulthomepage = function(req,res){
	themeController.customLayout({
			req: req,
			res: res,
			next: false,
			viewpath: 'home/index',
			layoutdata: {
				categories: {
					model: 'Category',
					search: {
						query: req.params.cat,
						sort: '-createdat',
						limit: 10,
						offset: 0
					}
				},
				items: {
					model: 'Item',
					search: {
						query: req.params.item,
						sort: '-publishat',
						limit: 10,
						offset: 0,
						population: 'authors primaryauthor contenttypes primaryasset tags categories '
					}
				},
				collections: {
					model: 'Collection',
					search: {
						query: req.params.item,
						sort: '-publishat',
						limit: 10,
						offset: 0,
						population: 'tags categories authors assets primaryasset contenttypes primaryauthor'
					}
				},
				tags: {
					model: 'Tag',
					search: {
						query: req.params.item,
						sort: '-createdat',
						limit: 10,
						offset: 0
					}
				},
				authors: {
					model: 'User',
					search: {
						query: req.params.item,
						sort: '-createdat',
						limit: 10,
						offset: 0
					}
				},
				contenttypes: {
					model: 'Contenttype',
					search: {
						query: req.params.item,
						sort: '-createdat',
						limit: 10,
						offset: 0
					}
				}
			}
		});
};

var homepage = function(req,res){
	if(appSettings.themeSettings && appSettings.themeSettings.settings){
		req.params.id = appSettings.themeSettings.settings['homepage-value'];
		req.controllerData = (req.controllerData) ? req.controllerData : {};
		var params = req.params,
			docid,
			population;
		if(appSettings.themeSettings.settings.homepage ==='item'){
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
		}
		else if(appSettings.themeSettings.settings.homepage ==='collection'){
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
		}
		else{
			defaulthomepage(req,res);
		}
	}
	else{
		defaulthomepage(req,res);
	}
};

var setCacheHeader = function(req,res,next){
	var httpPathName = req._parsedUrl.pathname;
	if(appSettings.themeSettings && appSettings.themeSettings.settings){
		switch(true){
			case httpPathName==='/':
				logger.silly('using home cache headers');
				res.header('Cache-Control', appSettings.themeSettings.settings['home cache control settings']);
				break;
			case httpPathName==='/items' || (/item\//gi.test(httpPathName)):
				logger.silly('using item cache headers');
				res.header('Cache-Control', appSettings.themeSettings.settings['item cache control settings']);
				break;
			case httpPathName==='/collections' || (/collection\//gi.test(httpPathName)):
				logger.silly('using collection cache headers');
				res.header('Cache-Control', appSettings.themeSettings.settings['collection cache control settings']);
				break;
			case httpPathName==='/browse' || (/browse\//gi.test(httpPathName)):
				logger.silly('using browse cache headers');
				res.header('Cache-Control', appSettings.themeSettings.settings['browse cache control settings']);
				break;
			default:
				logger.silly('using default cache headers');
				res.header('Cache-Control', appSettings.themeSettings.settings['default cache control settings']);
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


	return {
		homepage: homepage,
		setCacheHeader: setCacheHeader
	};
};

module.exports = controller;