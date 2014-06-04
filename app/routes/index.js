'use strict';

var path = require('path'),
	fs = require('fs');

module.exports = function(periodic){
	// express,app,logger,config,db
	var models = require('../../content/config/model')({
			mongoose : periodic.db.mongoose,
			dburl: periodic.db.url,
			debug: periodic.settings.debug
		}),
		postRouter = periodic.express.Router(),
		postController = require('../controller/post')(periodic),
		tagRouter = periodic.express.Router(),
		collectionRouter = periodic.express.Router(),
		searchRouter = periodic.express.Router(),
		appRouter = periodic.express.Router(),
		themeRoute = path.join(path.resolve(__dirname,"../../content/themes",periodic.settings.theme),'routes.js');

	if(periodic.settings.theme && fs.existsSync(themeRoute)){
		require(themeRoute)(periodic);
	}

	appRouter.get('/',function(req,res){
		console.log("got first index");
		res.render('home/index',{randomdata:'twerkin'});
	});
	// periodic.app.get('/',function(req,res){
	// 	console.log("override index");
	// 	res.render('home/index',{randomdata:'index override'});
	// });

	/*post: by id, get multiple posts by ids, get multiple posts by types */
	postRouter.get('/:id',postController.show);
	// postRouter.get('/group/:ids',postController.showType);
	// postRouter.get('/type/:types',postController.showType);

	/* tags: get tag, get posts by tag  */
	// tagRouter.get('/:id',tagController.show);
	// tagRouter.get('/:ids/posts',tagController.show);

	/* collections: get collection, get posts by collection, get posts by collection and tags */
	// collectionRouter.get('/:id',collectionRouter.show);
	// collectionRouter.get('/:id/posts',collectionRouter.show);
	// collectionRouter.get('/:id/posts/:tags',collectionRouter.show);

	/* searchs: search posts, search tags, search collections */
	// searchRouter.get('/:searchquery',searchController.searchPosts);
	// searchRouter.get('/posts/:searchquery',searchController.searchPosts);
	// searchRouter.get('/tags/:searchquery',searchController.searchTags);
	// searchRouter.get('/collections/:searchquery',searchController.searchCollections);

	periodic.app.use(appRouter);
	periodic.app.use('/post',postRouter);
	// periodic.app.use('/posts',searchController.searchPosts);
	// periodic.app.use('/tag',tagRouter);
	// periodic.app.use('/collection',collectionRouter);
	// periodic.app.use('/search',searchRouter);
};