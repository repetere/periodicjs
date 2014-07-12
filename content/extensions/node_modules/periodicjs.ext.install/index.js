'use strict';

module.exports = function(periodic){
	// express,app,logger,config,db,mongoose
	var installRouter = periodic.express.Router(),
			installController = require('./controller/install')(periodic);

	installRouter.get('/', installController.index);
	installRouter.get('/install', installController.index);
	installRouter.get('/install/getlog',installController.get_outputlog);
	installRouter.post('/install/updateconfig', installController.update);
	installRouter.get('/*', installController.index);

	periodic.app.use(installRouter);
};