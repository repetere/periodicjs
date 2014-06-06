var path = require('path'),
	passport = require('passport');

module.exports = function(periodic){
	// express,app,logger,config,db,mongoose
	var authRouter = periodic.express.Router(),
		authController = require('./controller/auth')(periodic),
		userRouter = periodic.express.Router(),
		userController = require('./controller/user')(periodic),
		appUserController = require('../../../../app/controller/user')(periodic);

	authRouter.get('/login', userController.login);
	authRouter.post('/login', authController.login);
	authRouter.get('/logout', authController.logout);
	authRouter.get('/facebook', authController.facebook);
	authRouter.get('/facebook/callback', authController.facebookcallback);
	// authRouter.get('/mobile/login', authController.mobileLogin);
	// authRouter.get('/mobile/requestcsrf', authController.requestCSRF);	

	userRouter.get('/new|/register', userController.newuser);
	userRouter.get('/finishregistration', userController.finishregistration);
	// userRouter.get('/:id', userController.loadFullUser, userController.show);
	// userRouter.get('/:id/edit', userController.ensureAuthenticated, userController.loadUser, userController.edit);

	userRouter.post('/new', userController.create);
	userRouter.post('/finishregistration', userController.updateuserregistration);
	// userRouter.post('/updatefastregistration', userController.updatefastregistration);
	// userRouter.post('/search/:searchquery', userController.ensureAuthenticated, userController.search);
	// userRouter.post('/:id/edit', userController.ensureAuthenticated, userController.loadUser, userController.update);
	// userRouter.post('/:id/delete', userController.ensureAuthenticated, userController.loadUser, userController.delete);

	periodic.app.use(authController.rememberme);
	periodic.app.use(passport.initialize());
	periodic.app.use(passport.session());
	periodic.app.use('/auth',authRouter);
	periodic.app.use('/user',userRouter);
};