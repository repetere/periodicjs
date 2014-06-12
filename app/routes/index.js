'use strict';

var path = require('path'),
	fs = require('fs'),
	ExtentionLoader = require('../lib/extensions');

module.exports = function(periodic){
	// express,app,logger,config/settings,db
	var models = require('../../content/config/model')({
			mongoose : periodic.db.mongoose,
			dburl: periodic.db.url,
			debug: periodic.settings.debug
		}),
		periodicController = require('../controller/periodic')(periodic),
		homeController = require('../controller/home')(periodic),
		postController = require('../controller/post')(periodic),
		tagController = require('../controller/tag')(periodic),
		categoryController = require('../controller/category')(periodic),
		postRouter = periodic.express.Router(),
		tagRouter = periodic.express.Router(),
		collectionRouter = periodic.express.Router(),
		categoryRouter = periodic.express.Router(),
		searchRouter = periodic.express.Router(),
		appRouter = periodic.express.Router(),
		themeRoute = path.join(periodic.settings.themepath,'routes.js'),
		extensions = new ExtentionLoader(periodic.settings);

	extensions.loadExtensions(periodic);

	if(periodic.settings.theme && fs.existsSync(themeRoute)){
		require(themeRoute)(periodic);
	}

	appRouter.get('/',homeController.index);
	appRouter.get('/404|/notfound',homeController.error404);
	// periodic.app.get('/',function(req,res){
	// 	console.log("override index");
	// 	res.render('home/index',{randomdata:'index override'});
	// });

	/*post: by id, get multiple posts by ids, get multiple posts by types */
	postRouter.get('/search',postController.loadPost,postController.show);
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
	// periodic.app.use('/search',searchRouter);
	periodic.app.use(appRouter);
};