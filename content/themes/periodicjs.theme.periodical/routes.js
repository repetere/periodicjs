'use strict';
var path = require('path');

module.exports = function (periodic) {
	var periodicalController = require('./controller/periodical')(periodic),
		itemController = require(path.join(process.cwd(), 'app/controller/item'))(periodic),
		themeRouter = periodic.express.Router();

	require('./scripts/setup')(periodic);

	// create new route to document items to post
	themeRouter.get('/browse/:entitytype|/browse/:entitytype/:entityitems|/author/:id|/search|/404|/notfound|/collections|/collection/:id|/collection/search|/items|/item/search|/articles|/item/:id', periodicalController.setCacheHeader);

	themeRouter.get('periodical/:id', itemController.loadFullItem, itemController.show);
	themeRouter.get('/items', itemController.loadItems, itemController.index);
	themeRouter.get('/', periodicalController.setCacheHeader, periodicalController.homepage);

	periodic.app.use(themeRouter);
};
