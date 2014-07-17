'use strict';

module.exports = function(periodic){
	// express,app,logger,config,db,mongoose
	var mailRouter = periodic.express.Router(),
			mailController = require('./controller/mailer')(periodic);

	mailRouter.post('/testmail', mailController.sendmail);

	periodic.app.use('/p-admin/mailer',mailRouter);
};