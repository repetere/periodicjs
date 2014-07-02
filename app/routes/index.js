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
		postRouter = periodic.express.Router(),
		tagRouter = periodic.express.Router(),
		collectionRouter = periodic.express.Router(),
		categoryRouter = periodic.express.Router(),
		searchRouter = periodic.express.Router(),
		contenttypeRouter = periodic.express.Router(),
		userRouter = periodic.express.Router(),
		appRouter = periodic.express.Router(),
		themeRoute = path.join(periodic.settings.themepath,'routes.js'),
		extensions = new ExtentionLoader(periodic.settings);

	periodic.settings.extconf =extensions.settings();
	extensions.loadExtensions(periodic);

	if(periodic.settings.theme && fs.existsSync(themeRoute)){
		require(themeRoute)(periodic);
	}

	appRouter.get('/',homeController.index);
	appRouter.get('/404|/notfound',homeController.error404);
	/*post: by id, get multiple posts by ids, get multiple posts by types */
	postRouter.get('/search',postController.loadPosts,searchController.results);
	postRouter.get('/:id',postController.loadPost,postController.show);
	// postRouter.get('/group/:ids',postController.showType);
	// postRouter.get('/type/:types',postController.showType);

	/* tags: get tag, get posts by tag  */
	// tagRouter.get('/:id',tagController.show);
	// tagRouter.get('/:ids/posts',tagController.show);
	tagRouter.get('/search.:ext',tagController.loadTags,tagController.searchResults);
	tagRouter.get('/search',tagController.loadTags,tagController.searchResults);

	/* collections(slideshows): get collection, get posts by collection, get posts by collection and tags */
	// collectionRouter.get('/:id',collectionRouter.show);
	// collectionRouter.get('/:id/post/:postid',collectionRouter.show);
	// collectionRouter.get('/:id/page/:pagenumber',collectionRouter.show);

	/* categories: get collection, get posts by collection, get posts by collection and tags */
	// categoryRouter.get('/:id',categoryRouter.show);
	// categoryRouter.get('/:id/posts',categoryRouter.show);
	// categoryRouter.get('/:id/posts/:tags',categoryRouter.show);
	categoryRouter.get('/search.:ext',categoryController.loadCategories,categoryController.searchResults);
	categoryRouter.get('/search',categoryController.loadCategories,categoryController.searchResults);

	contenttypeRouter.get('/search.:ext',contenttypeController.loadContenttypes,contenttypeController.searchResults);
	contenttypeRouter.get('/search',contenttypeController.loadContenttypes,contenttypeController.searchResults);

	userRouter.get('/search.:ext',userController.loadUsers,userController.searchResults);
	userRouter.get('/search',userController.loadUsers,userController.searchResults);

	/* searchs: search posts, search tags, search collections */
	// searchRouter.get('/:searchquery',searchController.searchPosts);
	// searchRouter.get('/posts/:searchquery',searchController.searchPosts);
	// searchRouter.get('/tags/:searchquery',searchController.searchTags);
	// searchRouter.get('/collections/:searchquery',searchController.searchCollections);
	appRouter.get('*',homeController.catch404);

	periodic.app.use('/post',postRouter);
	periodic.app.use('/tag',tagRouter);
	periodic.app.use('/category',categoryRouter);
	// periodic.app.use('/collection',collectionRouter);
	periodic.app.use('/user',userRouter);
	periodic.app.use('/contenttype',contenttypeRouter);
	periodic.app.use(appRouter);
};