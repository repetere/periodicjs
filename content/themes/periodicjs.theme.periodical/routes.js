'use strict';
var path = require('path');

module.exports = function (periodic) {
	var periodicalController = require('./controller/periodical')(periodic),
		itemController = require(path.join(process.cwd(), 'app/controller/item'))(periodic),
		themeRouter = periodic.express.Router();

	require('./scripts/setup')(periodic);

	// create new route to document items to post
	themeRouter.all('*', periodicalController.setCacheHeader);
	themeRouter.get('periodical/:id', itemController.loadFullItem, itemController.show);
	themeRouter.get('/items', itemController.loadItems, itemController.index);
	themeRouter.get('/', periodicalController.homepage);

	periodic.app.use(themeRouter);
};
