var path = require('path'),
	multer  = require('multer');
module.exports = function(periodic){
	// express,app,logger,config,db,mongoose
	var adminRouter = periodic.express.Router(),
		postRouter = periodic.express.Router(),
		tagRouter = periodic.express.Router(),
		tagAdminRouter = periodic.express.Router(),
		contenttypeRouter = periodic.express.Router(),
		contenttypeAdminRouter = periodic.express.Router(),
		categoryRouter = periodic.express.Router(),
		categoryAdminRouter = periodic.express.Router(),
		extensionRouter = periodic.express.Router(),
		themeRouter = periodic.express.Router(),
		themeController = require('../../../../app/controller/theme')(periodic),
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
	adminRouter.get('/extensions',authController.ensureAuthenticated,adminController.loadExtensions,adminController.extensions_index);
	adminRouter.get('/themes',authController.ensureAuthenticated,adminController.loadThemes,adminController.themes_index);
	adminRouter.get('/posts',authController.ensureAuthenticated,postController.loadPosts,adminController.posts_index);
	adminRouter.get('/contenttypes',authController.ensureAuthenticated,contenttypeController.loadContenttypes,adminController.contenttypes_index);
	adminRouter.get('/tags',authController.ensureAuthenticated,tagController.loadTags,adminController.tags_index);
	adminRouter.get('/categories',authController.ensureAuthenticated,categoryController.loadCategories,adminController.categories_index);
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
	/**
	 * admin/theme manager routes
	 */
	themeRouter.get('/install',authController.ensureAuthenticated,themeController.install);
	themeRouter.get('/install/log/:theme/:date',authController.ensureAuthenticated,themeController.install_getOutputLog);
	themeRouter.get('/remove/log/:theme/:date',authController.ensureAuthenticated,themeController.remove_getOutputLog);
	themeRouter.get('/cleanup/log/:theme/:date',authController.ensureAuthenticated,themeController.cleanup_log);
	themeRouter.get('/:id/enable',authController.ensureAuthenticated,themeController.enable);
	themeRouter.post('/:id/delete',authController.ensureAuthenticated,themeController.remove);
	themeRouter.get('/:id',authController.ensureAuthenticated,adminController.loadTheme,adminController.theme_show);
	/**
	 * admin/post manager routes
	 */
	adminRouter.get('/post/new',authController.ensureAuthenticated,adminController.post_new);
	adminRouter.get('/post/edit/:id',authController.ensureAuthenticated,postController.loadFullPost,adminController.post_edit);
	postRouter.post('/new',postController.loadPost,authController.ensureAuthenticated,postController.create);
	postRouter.post('/edit',authController.ensureAuthenticated,postController.update);
	/**
	 * admin/tag manager routes
	 */
	tagRouter.post('/new/:id',multer({ dest: process.cwd() + '/public/uploads/files'}),tagController.loadTag,tagController.create);
	tagRouter.post('/new',multer({ dest: process.cwd() + '/public/uploads/files'}),tagController.loadTag,tagController.create);
	tagAdminRouter.get('/:id',authController.ensureAuthenticated,tagController.loadTag,adminController.tag_show);
	/**
	 * admin/category manager routes
	 */
	categoryRouter.post('/new/:id',multer({ dest: process.cwd() + '/public/uploads/files'}),categoryController.loadCategory,categoryController.create);
	categoryRouter.post('/new',multer({ dest: process.cwd() + '/public/uploads/files'}),categoryController.loadCategory,categoryController.create);
	categoryAdminRouter.get('/:id',authController.ensureAuthenticated,categoryController.loadCategory,adminController.category_show);
	/**
	 * admin/categorytype manager routes
	 */
	contenttypeRouter.post('/new/:id',multer({ dest: process.cwd() + '/public/uploads/files'}),contenttypeController.loadContenttype,contenttypeController.create);
	contenttypeRouter.post('/new',multer({ dest: process.cwd() + '/public/uploads/files'}),contenttypeController.loadContenttype,contenttypeController.create);
	contenttypeRouter.post('/append/:id',authController.ensureAuthenticated,contenttypeController.loadContenttype,contenttypeController.append);
	contenttypeRouter.post('/removeitem/:id',authController.ensureAuthenticated,contenttypeController.loadContenttype,contenttypeController.removeitem);
	contenttypeAdminRouter.get('/:id',authController.ensureAuthenticated,contenttypeController.loadContenttype,adminController.contenttype_show);
	/**
	 * admin/collections manager routes
	 */

	adminRouter.use('/extension',extensionRouter);
	adminRouter.use('/theme',themeRouter);
	adminRouter.use('/contenttype',contenttypeAdminRouter);
	adminRouter.use('/tag',tagAdminRouter);
	adminRouter.use('/category',categoryAdminRouter);
	periodic.app.use('/p-admin',adminRouter);
	periodic.app.use('/post',postRouter);
	periodic.app.use('/tag',tagRouter);
	periodic.app.use('/category',categoryRouter);
	periodic.app.use('/contenttype',contenttypeRouter);
};