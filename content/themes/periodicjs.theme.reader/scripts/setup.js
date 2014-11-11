'use strict';
var CoreControllerHelper = require('periodicjs.core.controller'),
	CoreController,
	Contenttype,
	AppDBSetting,
	logger,
	mongoose,
	existingPeriodicContentType,
	existingPeriodicCollectionContentType,
	usablePeriodicContentType,
	usablePeriodicCollectionContentType,
	itemDefaultContenttype,
	collectionDefaultContenttype,
	newPeriodicalContentTypeDocument = {
		title: 'periodical',
		name: 'periodical',
		attributes: [{
			title: 'dek',
			datatype: 'string',
			name: 'dek',
		}, {
			title: 'effect',
			datatype: 'array',
			defaultvalue: 'push,fadeout,side,sidefixed,jam3',
			name: 'effect',
		}, {
			title: 'static',
			datatype: 'array',
			defaultvalue: 'false,true',
			name: 'static',
		}, {
			title: 'css class',
			datatype: 'string',
			defaultvalue: '',
			name: 'css-class',
		}, {
			title: 'in collection preview',
			datatype: 'array',
			defaultvalue: 'false,true',
			name: 'in-collection-preview',
		}, {
			title: 'in volume preview',
			datatype: 'array',
			defaultvalue: 'false,true',
			name: 'in-volume-preview',
		}]
	},
	newPeriodicalCollectionContentTypeDocument = {
		title: 'periodical collection',
		name: 'periodical-collection',
		attributes: [{
			title: 'dek',
			datatype: 'string',
			name: 'dek',
		}, {
			title: 'effect',
			datatype: 'array',
			defaultvalue: 'linotype,slideshow,listical,list,grid',
			name: 'effect',
		}, {
			title: 'use background image',
			datatype: 'array',
			defaultvalue: 'true,false',
			name: 'use-background-image',
		}, {
			title: 'use collection intro',
			datatype: 'array',
			defaultvalue: 'true,false',
			name: 'use-collection-intro',
		}, {
			title: 'content only',
			datatype: 'array',
			defaultvalue: 'false,true',
			name: 'content-only',
		}, {
			title: 'css class',
			datatype: 'string',
			defaultvalue: '',
			name: 'css-class',
		}, {
			title: 'static',
			datatype: 'array',
			defaultvalue: 'false,true',
			name: 'static',
		}, {
			title: 'in volume preview',
			datatype: 'array',
			defaultvalue: 'false,true',
			name: 'in-volume-preview',
		}]
	};



var updateDefaultItemContentType = function (appsettingdocumenttouse) {
	var alreadyHasDefault = false;
	for (var x in appsettingdocumenttouse.value) {
		if (usablePeriodicContentType._id.toString() === appsettingdocumenttouse.value[x].toString()) {
			alreadyHasDefault = true;
		}
	}
	if (alreadyHasDefault) {
		logger.silly('appsettingdocumenttouse.value', appsettingdocumenttouse.value, 'already has', usablePeriodicContentType._id);
	}
	else {
		var objectToModify = {
			'value': usablePeriodicContentType._id
		};
		CoreController.updateModel({
			model: AppDBSetting,
			id: appsettingdocumenttouse._id,
			appendArray: true,
			updatedoc: objectToModify,
			callback: function (err, updatedsetting) {
				if (err) {
					logger.error(err);
				}
				else {
					console.log('updated settings', updatedsetting);
				}
			}
		});
	}
};

var updateDefaultCollectionContentType = function (appsettingdocumenttouse) {
	var alreadyHasDefault = false;
	for (var x in appsettingdocumenttouse.value) {
		if (usablePeriodicCollectionContentType._id.toString() === appsettingdocumenttouse.value[x].toString()) {
			alreadyHasDefault = true;
		}
	}
	if (alreadyHasDefault) {
		logger.silly('appsettingdocumenttouse.value', appsettingdocumenttouse.value, 'already has', usablePeriodicCollectionContentType._id);
	}
	else {
		var objectToModify = {
			'value': usablePeriodicCollectionContentType._id
		};
		CoreController.updateModel({
			model: AppDBSetting,
			id: appsettingdocumenttouse._id,
			appendArray: true,
			updatedoc: objectToModify,
			callback: function (err, updatedsetting) {
				if (err) {
					logger.error(err);
				}
				else {
					console.log('updated collection settings', updatedsetting);
				}
			}
		});
	}
};

var createDefaultItemContentType = function () {
	var newDefaultItemContentType = {
		name: 'item_default_contenttypes'
	};

	CoreController.createModel({
		model: AppDBSetting,
		newdoc: newDefaultItemContentType,
		callback: function (err, newappsettingdocument) {
			if (err) {
				logger.error(err);
			}
			else {
				itemDefaultContenttype = newappsettingdocument;
				logger.silly('add newly created default item content type');
				updateDefaultItemContentType(itemDefaultContenttype);
			}
		}
	});
};

var createDefaultCollectionContentType = function () {
	var newDefaultCollectionContentType = {
		name: 'collection_default_contenttypes'
	};

	CoreController.createModel({
		model: AppDBSetting,
		newdoc: newDefaultCollectionContentType,
		callback: function (err, newappsettingdocument) {
			if (err) {
				logger.error(err);
			}
			else {
				collectionDefaultContenttype = newappsettingdocument;
				logger.silly('add newly created default collection content type');
				updateDefaultCollectionContentType(collectionDefaultContenttype);
			}
		}
	});
};

var addDefaultItemContentType = function () {
	CoreController.loadModel({
		docid: 'item_default_contenttypes',
		model: AppDBSetting,
		callback: function (err, appsettingdocument) {
			if (err) {
				logger.error(err);
			}
			else if (appsettingdocument) {
				itemDefaultContenttype = appsettingdocument;
				logger.silly('add default content type');
				updateDefaultItemContentType(itemDefaultContenttype);
			}
			else {
				logger.silly('create new default item content type');
				createDefaultItemContentType();
			}
		}
	});
};

var addDefaultCollectionContentType = function () {
	CoreController.loadModel({
		docid: 'collection_default_contenttypes',
		model: AppDBSetting,
		callback: function (err, appsettingdocument) {
			if (err) {
				logger.error(err);
			}
			else if (appsettingdocument) {
				collectionDefaultContenttype = appsettingdocument;
				logger.silly('add default collection content type');
				updateDefaultCollectionContentType(collectionDefaultContenttype);
			}
			else {
				logger.silly('create new default collection content type');
				createDefaultCollectionContentType();
			}
		}
	});
};

var checkContentTypePeriodical = function (docid, callback) {
	logger.silly('checkContentTypePeriodical');
	CoreController.loadModel({
		docid: docid,
		model: Contenttype,
		callback: callback
	});
};

var updatePeriodicalContentType = function (entitytype, callback) {
	var entitytypeid = (entitytype === 'collection') ? existingPeriodicCollectionContentType._id : existingPeriodicContentType._id;
	var entitydefaultcontenttype = (entitytype === 'collection') ? newPeriodicalCollectionContentTypeDocument : newPeriodicalContentTypeDocument;
	CoreController.updateModel({
		model: Contenttype,
		id: entitytypeid,
		updatedoc: entitydefaultcontenttype,
		callback: callback
	});
};

var createPeriodicalContentType = function (entitytype, callback) {
	var entitydefaultcontenttype = (entitytype === 'collection') ? newPeriodicalCollectionContentTypeDocument : newPeriodicalContentTypeDocument;
	CoreController.createModel({
		model: Contenttype,
		newdoc: entitydefaultcontenttype,
		callback: callback
	});
};

var setup = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	// appSettings = resources.settings,
	CoreController = new CoreControllerHelper(resources);
	Contenttype = mongoose.model('Contenttype');
	AppDBSetting = mongoose.model('Setting');

	mongoose.connection.on('open', function () {
		checkContentTypePeriodical('periodical', function (err, doc) {
			if (err) {
				logger.error(err);
			}
			else if (doc) {
				existingPeriodicContentType = doc;
				updatePeriodicalContentType('item', function (err, updatedcontenttype) {
					if (err) {
						logger.error(err);
					}
					else {
						logger.info('Old Periodical Content Type');
						// console.log(existingPeriodicContentType);
						logger.info('Updated Periodical Content Type');
						// console.log(updatedcontenttype);
						usablePeriodicContentType = updatedcontenttype;
						addDefaultItemContentType();
					}
				});
			}
			else {
				createPeriodicalContentType('item', function (err, newcontenttype) {
					if (err) {
						logger.error(err);
					}
					else {
						logger.info('createdNewContentType');
						// console.log(newcontenttype);
						usablePeriodicContentType = newcontenttype;
						addDefaultItemContentType();
					}
				});
			}
		});

		checkContentTypePeriodical('periodical-collection', function (err, doc) {
			if (err) {
				logger.error(err);
			}
			else if (doc) {
				existingPeriodicCollectionContentType = doc;
				updatePeriodicalContentType('collection', function (err, updatedcontenttype) {
					if (err) {
						logger.error(err);
					}
					else {
						logger.info('Old Periodical Collection Content Type');
						// console.log(existingPeriodicContentType);
						logger.info('Updated Periodical Collection Content Type');
						// console.log(updatedcontenttype);
						usablePeriodicCollectionContentType = updatedcontenttype;
						addDefaultCollectionContentType();
					}
				});
			}
			else {
				createPeriodicalContentType('collection', function (err, newcollectioncontenttype) {
					if (err) {
						logger.error(err);
					}
					else {
						logger.info('createdNewCollectionContentType');
						// console.log(newcontenttype);
						usablePeriodicCollectionContentType = newcollectioncontenttype;
						addDefaultCollectionContentType();
					}
				});
			}
		});
	});
};

module.exports = setup;
