'use strict';
var path = require('path'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controllerhelper'),
	CoreUtilities,
	CoreController,
	themeController,
	logger;

var homepage = function(req,res){
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

var setCacheHeader = function(req,res,next){
	logger.warn('settings headers');
	res.header('Cache-Control', 'public, max-age=86400');
	next();
};

var controller = function (resources) {
	logger = resources.logger;
	// mongoose = resources.mongoose;
	// appSettings = resources.settings;
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	themeController = require(path.join(process.cwd(), 'app/controller/theme'))(resources);

	return {
		homepage: homepage,
		setCacheHeader: setCacheHeader
	};
};

module.exports = controller;