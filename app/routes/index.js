'use strict';

module.exports = function(periodic){
	// express,app,logger,config,db
	var models = require('../../content/config/model')({mongoose : periodic.db.mongoose, dburl: periodic.db.url}),
		postRouter = periodic.express.Router(),
		postController = require('../controller/post')(periodic),
		tagRouter = periodic.express.Router(),
		collectionRouter = periodic.express.Router(),
		searchRouter = periodic.express.Router(),
		appRouter = periodic.express.Router();

	appRouter.get('/',function(req,res){
		console.log("got ijhgkjht");
		res.render('home/index',{randomdata:'twerkin'});
	});

	postRouter.get('/',postController.index);
	postRouter.get('/:id',postController.show);

	periodic.app.use(appRouter);
	periodic.app.use('/post',postRouter);
};