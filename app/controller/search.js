'use strict';

var path = require('path'),
	appController = require('./application'),
	async = require('async'),
	applicationController,
	appSettings,
	mongoose,
	logger,
	Post,Collection,User,Contenttype,Category,Tag;

var results = function(req,res,next){
	applicationController.getPluginViewDefaultTemplate(
		{
			viewname:'search/index',
			themefileext:appSettings.templatefileextension
		},
		function(err,templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:"Search Results"
					},
					docs:req.controllerData.searchdocuments,
					user: applicationController.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var index = function(req,res,next){
	applicationController.getPluginViewDefaultTemplate(
		{
			viewname:'browse/index',
			themefileext:appSettings.templatefileextension
		},
		function(err,templatepath){
			applicationController.handleDocumentQueryRender({
				res:res,
				req:req,
				renderView:templatepath,
				responseData:{
					pagedata: {
						title:'Browse'
					},
					docs:req.controllerData.searchdocuments,
					tags:req.controllerData.browsetags,
					user:req.user
				}
			});
		}
	);
};

var browse = function(req,res,next){
	var query ={},
			searchdocuments,
			params = req.params,
			offset = req.query.offset,
			sort = req.query.sort,
			limit = req.query.limit,
			// selection = 'title content tags.title tags.name categories.title categories.name authors.username contenttypes primaryasset primaryauthor.username',
			population = 'tags categories authors contenttypes primaryasset primaryauthor';
	req.controllerData = (req.controllerData)?req.controllerData:{};

	if(params.entitytype){
		switch(params.entitytype){
			case 'authors':
				query = {
					$or: [{
			        'primaryauthor':{
			          $in:req.controllerData.filteridarray
			        }
						}, {
		        'authors':{
		          $in:req.controllerData.filteridarray
		        }
					}]
	      };
				break;
			case 'categories':
				query = {
	        'categories':{
	          $in:req.controllerData.filteridarray
	        }
	      };
				break;
			case 'tags':
				query = {
	        'tags':{
	          $in:req.controllerData.filteridarray
	        }
	      };
				break;
			case 'contenttypes':
				query = {
	        'contenttypes':{
	          $in:req.controllerData.filteridarray
	        }
	      };
				break;
			default:
				next(new Error("Invalid Entity Type"));
				break;
		}
	}
	else{
		var searchRegEx = new RegExp(applicationController.stripTags(req.query.search), "gi");
		if(req.query.search===undefined || req.query.search.length<1){
			query={};
		}
		else{
			query = {
				$or: [{
					title: searchRegEx,
					}, {
					'name': searchRegEx,
				}, {
					'content': searchRegEx,
				}]
			};
		}
	}

	async.parallel({
		searchCollections:function(callback){
			applicationController.searchModel({
				model:Collection,
				query:query,
				sort:sort,
				limit:limit,
				offset:offset,
				// selection:selection,
				population:population,
				callback:callback
			});
		},
		searchDocuments:function(callback){
			applicationController.searchModel({
				model:Post,
				query:query,
				sort:sort,
				limit:limit,
				offset:offset,
				// selection:selection,
				population:population,
				callback:callback
			});
		}
	},function(err,results){
		if(err){
			next(err);
		}
		else{
			searchdocuments = results.searchDocuments.concat(results.searchCollections);
			req.controllerData.searchdocuments = searchdocuments.sort(applicationController.sortObject("desc","createdat"));
			next();
		}
	});
};

var queryFilters = function(options,callback){
	var model = options.model,
			namesarray = options.namesarray,
			nameval = options.nameval,
			query={};
	if(namesarray.length<1){
		query={};
	}
	else if(nameval && nameval === "username"){
		query={
			'username':{
		    $in:namesarray
		  }
		};
	}
	else{
		query = {
		'name':{
	      $in:namesarray
	    }
	  };
	}
	model.find(query,'_id name username',callback);
};

var browsefilter = function(req,res,next){
	var params = req.params,
			namesarray = (params.entityitems)? params.entityitems.split(',') : [],
			filterIdArray = [],
			defaultResponseFunction = function(err,filterdocs,req,next){
				if(err){
					next(err);
				}
				else{
					for(var x in filterdocs){
						filterIdArray.push(filterdocs[x]._id);
					}
					req.controllerData.filteridarray = filterIdArray;
					next();
				}
			};

	req.controllerData = (req.controllerData)?req.controllerData:{};
	switch(params.entitytype){
		case 'authors':
			queryFilters({
				model:User,
				nameval:'username',
				namesarray:namesarray
			},function(err,filterdocs){
				defaultResponseFunction(err,filterdocs,req,next);
			});
			break;
		case 'categories':
			queryFilters({
				model:Category,
				nameval:'name',
				namesarray:namesarray
			},function(err,filterdocs){
				defaultResponseFunction(err,filterdocs,req,next);
			});
			break;
		case 'tags':
			queryFilters({
				model:Tag,
				nameval:'name',
				namesarray:namesarray
			},function(err,filterdocs){
				defaultResponseFunction(err,filterdocs,req,next);
			});
			break;
		case 'contenttypes':
			queryFilters({
				model:Contenttype,
				nameval:'name',
				namesarray:namesarray
			},function(err,filterdocs){
				defaultResponseFunction(err,filterdocs,req,next);
			});
			break;
		default:
			next(new Error("Invalid Entity Type"));
			break;
	}
};

var browsetags = function(req,res,next){
	var params = req.params,
			offset = req.query.offset,
			query = {},
			sort = req.query.sort,
			limit = req.query.limit,
			searchFunction = function(options,callback){
				var model = options.model,
						selection = options.selection;
				applicationController.searchModel({
					model:model,
					query:query,
					sort:sort,
					limit:limit,
					offset:offset,
					selection:selection,
					callback:function(err,tags){
							if(err){
								next(err);
							}
							else{
								req.controllerData.browsetags = tags;
								next();
							}
						}
					});
			};
	req.controllerData = (req.controllerData)?req.controllerData:{};
	switch(params.entitytype){
		case 'authors':
			searchFunction({
				model:User,
				selection:'firstname lastname username _id'
			});
			break;
		case 'categories':
			searchFunction({
				model:Category,
				selection:'name title _id'
			});
			break;
		case 'tags':
			searchFunction({
				model:Tag,
				selection:'name title _id'
			});
			break;
		case 'contenttypes':
			searchFunction({
				model:Contenttype,
				selection:'name title _id'
			});
			break;
		default:
			next(new Error("Invalid Entity Type"));
			break;
	}
};

var controller = function(resources){
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	applicationController = new appController(resources);
	Category = mongoose.model('Category');
	Collection = mongoose.model('Collection');
	Contenttype = mongoose.model('Contenttype');
	Post = mongoose.model('Post');
	Tag = mongoose.model('Tag');
	User = mongoose.model('User');

	return{
		results:results,
		browse:browse,
		index:index,
		browsefilter:browsefilter,
		browsetags: browsetags
	};
};

module.exports = controller;