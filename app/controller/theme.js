'use strict';
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/model/workout.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/model/media.js
// https://github.com/yawetse/getperiodic/blob/master/webapp/db/schema.js
// https://github.com/getperiodic/app.web-app/blob/master/dist/app/controller/home.js
// https://github.com/getperiodic/app.web-app/blob/master/dist/app/routes/home.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/controller/exercise.js
// https://github.com/silverlaketosoho/sweat/blob/master/repetere/controller/application.js
var path = require('path'),
	async = require('async'),
	appController = require('./application'),
	applicationController,
	appSettings,
	mongoose,
	logger,
	User, Category, Post;

var customLayout = function(options){
	var pagedata = options.pagedata,
		viewtype = options.viewtype,
		viewpath = options.viewpath,
		req = options.req,
		res = options.res,
		next = options.next,
		pluginname = options.pluginname,
		themepath = appSettings.themepath,
		themefileext = appSettings.templatefileextension,
		viewfilepath = (options.viewtype ==='theme')?
			path.join(themepath,'views',viewpath+'.'+themefileext) :
			path.join(process.cwd(),'content/extensions/node_modules',pluginname,'views',viewpath+'.'+themefileext),
		parallelTask = {};

	function getModelFromName(modelname){
		switch(modelname){
			case 'Category':
				return Category;
			case 'Post':
				return Post;
		}
	}
	function getTitleNameQuerySearch(searchterm){
		var searchRegEx = new RegExp(applicationController.stripTags(searchterm), "gi");

		if(searchterm===undefined || searchterm.length<1){
			return {};
		}
		else{
			return {
				$or: [{
					title: searchRegEx,
					}, {
					'name': searchRegEx,
				}]
			};
		}

	}
	function getAsyncCallback(functiondata){
		var querydata = (functiondata.search.customquery)? functiondata.search.customquery : getTitleNameQuerySearch(functiondata.search.query);
		return function(cb){
			console.log("functiondata.search.query",functiondata.search.query);
			applicationController.searchModel({
				model:getModelFromName(functiondata.model),
				query:querydata,
				sort:functiondata.search.sort,
				limit:functiondata.search.limit,
				offset:functiondata.search.offset,
				population:functiondata.search.population,
				callback:cb
			});
		};
	}
	for(var x in pagedata){
		parallelTask[x] = getAsyncCallback (pagedata[x]);
	}
	// an example using an object instead of an array
	async.parallel(
		parallelTask,
		function(err, results) {
			if(err){
				applicationController.handleDocumentQueryErrorResponse({
					err:err,
					res:res,
					req:req
				});
			}
			else{
				if(next){
					req.controllerData.layoutdata = results;
					next();
				}
				else{
					res.render(viewfilepath,{
						layoutdata:results,
						pagedata: {
								title:"custom page"
						},
						user:req.user
					});
				}
			}
		    // results is now equals to: {one: 1, two: 2}
	});
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	Post = mongoose.model('Post');
	User = mongoose.model('User');
	Category = mongoose.model('Category');

	return{
		customLayout:customLayout
	};
};

module.exports = controller;