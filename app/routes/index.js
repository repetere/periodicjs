'use strict';

var path = require('path'),
	fs = require('fs'),
	ExtentionLoader = require('../lib/extensions');

module.exports = function(periodic){
	// express,app,logger,config/settings,db
	var models = require('../../content/config/model')({
			mongoose : periodic.db.mongoose,
			dburl: periodic.db.url,
			debug: periodic.settings.debug,
			periodic:periodic
		}),
		periodicController = require('../controller/periodic')(periodic),
		homeController = require('../controller/home')(periodic),
		postController = require('../controller/post')(periodic),
		tagController = require('../controller/tag')(periodic),
		categoryController = require('../controller/category')(periodic),
		contenttypeController = require('../controller/contenttype')(periodic),
		userController = require('../controller/user')(periodic),
		searchController = require('../controller/search')(periodic),
		collectionController = require('../controller/collection')(periodic),
		themeController = require('../controller/theme')(periodic),
		postRouter = periodic.express.Router(),
		browseRouter = periodic.express.Router(),
		tagRouter = periodic.express.Router(),
		collectionRouter = periodic.express.Router(),
		categoryRouter = periodic.express.Router(),
		searchRouter = periodic.express.Router(),
		contenttypeRouter = periodic.express.Router(),
		userRouter = periodic.express.Router(),
		appRouter = periodic.express.Router(),
		extensions = new ExtentionLoader(periodic.settings);

	periodic.settings.extconf =extensions.settings();
	extensions.loadExtensions(periodic);

	if(periodic.settings.theme){
		var themeRoute = path.join(periodic.settings.themepath,'routes.js');
		if(fs.existsSync(themeRoute)){
			require(themeRoute)(periodic);
		}
	}

	/**
	 * root routes
	 */
	appRouter.get('/articles|/posts',postController.loadPosts,postController.index);
	appRouter.get('/collections',collectionController.loadCollections,collectionController.index);
	appRouter.get('/404|/notfound',homeController.error404);
	appRouter.get('/search',searchController.browse,searchController.results);

	/**
	 * documentpost-articles routes
	 */
	postRouter.get('/search',postController.loadPosts,postController.index);
	postRouter.get('/:id',postController.loadPost,postController.show);

	/**
	 * collections
	 */
	collectionRouter.get('/search',collectionController.loadCollections,collectionController.index);
	collectionRouter.get('/:id/page/:pagenumber',collectionController.loadCollection,collectionController.show);
	collectionRouter.get('/:id',collectionController.loadCollection,collectionController.show);

	/**
	 * tags
	 */
	tagRouter.get('/search.:ext',tagController.loadTags,tagController.searchResults);
	tagRouter.get('/search',tagController.loadTags,tagController.searchResults);

	/**
	 * categories
	 */
	categoryRouter.get('/search.:ext',categoryController.loadCategories,categoryController.searchResults);
	categoryRouter.get('/search',categoryController.loadCategories,categoryController.searchResults);

	/**
	 * content types
	 */
	contenttypeRouter.get('/search.:ext',contenttypeController.loadContenttypes,contenttypeController.searchResults);
	contenttypeRouter.get('/search',contenttypeController.loadContenttypes,contenttypeController.searchResults);

	/**
	 * authors
	 */
	userRouter.get('/search.:ext',userController.loadUsers,userController.searchResults);
	userRouter.get('/search',userController.loadUsers,userController.searchResults);

	/**
	 * browse/search
	 */
	browseRouter.get('/:entitytype/:entityitems',searchController.browsefilter,searchController.browse,searchController.index);
	browseRouter.get('/:entitytype',searchController.browsetags,searchController.browsefilter,searchController.browse,searchController.index);

	/**
	 * final root routes
	 */
	appRouter.get('/install/getlog',homeController.get_installoutputlog);
	// appRouter.get('/',postController.loadPosts,homeController.index);
	appRouter.get('/',function(req,res,next){
		themeController.customLayout({
			req:req,
			res:res,
			next:false,
			viewpath:'home/index',
			layoutdata:{
				categories:{
					model:'Category',
					search:{
						query:req.params.cat,sort:'-createdat',limit:10,offset:0
					}
				},
				docs:{
					model:'Post',
					search:{
						query:req.params.post,sort:'-createdat',limit:10,offset:0,population:'authors primaryauthor'
					}
				},
				collections:{
					model:'Collection',
					search:{
						query:req.params.post,sort:'-createdat',limit:10,offset:0
					}
				},
				tags:{
					model:'Tag',
					search:{
						query:req.params.post,sort:'-createdat',limit:10,offset:0
					}
				},
				authors:{
					model:'User',
					search:{
						query:req.params.post,sort:'-createdat',limit:10,offset:0
					}
				},
				contenttypes:{
					model:'Contenttype',
					search:{
						query:req.params.post,sort:'-createdat',limit:10,offset:0
					}
				}
			}
		});
	});
	appRouter.get('*',homeController.catch404);

	periodic.app.use('/post|/article|/document',postRouter);
	periodic.app.use('/tag',tagRouter);
	periodic.app.use('/category',categoryRouter);
	periodic.app.use('/collection',collectionRouter);
	periodic.app.use('/user',userRouter);
	periodic.app.use('/contenttype',contenttypeRouter);
	periodic.app.use('/browse',browseRouter);
	periodic.app.use(appRouter);
};