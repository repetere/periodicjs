var path = require('path'),
	multer  = require('multer');
module.exports = function(periodic){
	// express,app,logger,config,db,mongoose
	var adminRouter = periodic.express.Router(),
		postRouter = periodic.express.Router(),
		tagRouter = periodic.express.Router(),
		contenttypeRouter = periodic.express.Router(),
		categoryRouter = periodic.express.Router(),
		extensionRouter = periodic.express.Router(),
		extController = require('../../../../app/controller/extension')(periodic),
		postController = require('../../../../app/controller/post')(periodic),
		tagController = require('../../../../app/controller/tag')(periodic),
		categoryController = require('../../../../app/controller/category')(periodic),
		contenttypeController = require('../../../../app/controller/contenttype')(periodic),
		adminController = require('./controller/admin')(periodic),
		authController = require('../periodicjs.ext.login/controller/auth')(periodic);

	/**
	 * admin routes
	 */
	adminRouter.get('/',authController.ensureAuthenticated,adminController.index);
	adminRouter.get('/posts',authController.ensureAuthenticated,postController.loadPosts,adminController.posts_index);
	adminRouter.get('/post/new',authController.ensureAuthenticated,adminController.post_new);
	adminRouter.get('/post/edit/:id',authController.ensureAuthenticated,postController.loadFullPost,adminController.post_edit);
	adminRouter.get('/extensions',authController.ensureAuthenticated,adminController.loadExtensions,adminController.extensions_index);
	/**
	 * admin/extension manager routes
	 */
	extensionRouter.get('/install',authController.ensureAuthenticated,extController.install);
	extensionRouter.get('/install/log/:extension/:date',authController.ensureAuthenticated,extController.install_getOutputLog);
	extensionRouter.get('/remove/log/:extension/:date',authController.ensureAuthenticated,extController.remove_getOutputLog);
	extensionRouter.get('/cleanup/log/:extension/:date',authController.ensureAuthenticated,extController.cleanup_log);
	extensionRouter.get('/:id/disable',authController.ensureAuthenticated,extController.disable);
	extensionRouter.get('/:id/enable',authController.ensureAuthenticated,extController.enable);
	extensionRouter.post('/:id/delete',authController.ensureAuthenticated,extController.remove);
	extensionRouter.get('/:id',authController.ensureAuthenticated,adminController.loadExtension,adminController.extension_show);
	

	postRouter.post('/new',postController.loadPost,authController.ensureAuthenticated,postController.create);
	postRouter.post('/edit',authController.ensureAuthenticated,postController.update);

	tagRouter.post('/new/:id',multer({ dest: process.cwd() + '/public/uploads/files'}),tagController.loadTag,tagController.create);
	tagRouter.post('/new',multer({ dest: process.cwd() + '/public/uploads/files'}),tagController.loadTag,tagController.create);

	categoryRouter.post('/new/:id',multer({ dest: process.cwd() + '/public/uploads/files'}),categoryController.loadCategory,categoryController.create);
	categoryRouter.post('/new',multer({ dest: process.cwd() + '/public/uploads/files'}),categoryController.loadCategory,categoryController.create);

	contenttypeRouter.post('/new/:id',multer({ dest: process.cwd() + '/public/uploads/files'}),contenttypeController.loadContenttype,contenttypeController.create);
	contenttypeRouter.post('/new',multer({ dest: process.cwd() + '/public/uploads/files'}),contenttypeController.loadContenttype,contenttypeController.create);

	adminRouter.use('/extension',extensionRouter);
	periodic.app.use('/p-admin',adminRouter);
	periodic.app.use('/post',postRouter);
	periodic.app.use('/tag',tagRouter);
	periodic.app.use('/category',categoryRouter);
	periodic.app.use('/contenttype',contenttypeRouter);
};