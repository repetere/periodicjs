'use strict';

var controllerRoutes,
	coreControllerOptions,
	CoreController,
	CoreUtilities,
	appSettings,
	mongoose,
	Contenttype,
	User,
	logger;

var append = function (req, res) {
	var newattribute = CoreUtilities.removeEmptyObjectValues(req.body);
	newattribute.name = CoreUtilities.makeNiceAttribute(newattribute.title);
	var objectToModify = {
		'attributes': newattribute
	};

	CoreController.updateModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: Contenttype,
		id: req.controllerData.contenttype._id,
		updatedoc: objectToModify,
		saverevision: true,
		res: res,
		req: req,
		appendArray: true,
		successredirect: '/p-admin/contenttype/',
		appendid: true
	});
};

var removeitem = function (req, res) {
	var removeAttribute = CoreUtilities.removeEmptyObjectValues(req.body),
		objectToModify = {
			'attributes': removeAttribute
		};

	delete removeAttribute._csrf;

	logger.silly('req.body',req.body);
	logger.silly('objectToModify',objectToModify);
	logger.silly('removeAttribute',removeAttribute);


	CoreController.updateModel({
		model: Contenttype,
		id: req.controllerData.contenttype._id,
		updatedoc: objectToModify,
		saverevision: true,
		res: res,
		req: req,
		removeFromArray: true,
		successredirect: '/p-admin/contenttype/',
		appendid: true
	});
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	CoreController = resources.core.controller;
	CoreUtilities = resources.core.utilities;
	User = mongoose.model('User');
	Contenttype = mongoose.model('Contenttype');
	coreControllerOptions = {
		model_name:'contenttype',
		load_model_population:'author' ,
		load_multiple_model_population:'author',
		use_full_data:false,
		use_taxonomy_controllers:true,
	};
	controllerRoutes = CoreController.controller_routes(coreControllerOptions);
	controllerRoutes.append = append;
	controllerRoutes.removeitem = removeitem;
	return controllerRoutes;
};

module.exports = controller;
