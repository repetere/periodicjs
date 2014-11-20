'use strict';

var path = require('path'),
	async = require('async'),
	Utilities = require('periodicjs.core.utilities'),
	ControllerHelper = require('periodicjs.core.controller'),
	CoreUtilities,
	CoreController,
	appSettings,
	mongoose,
	userHelper,
	User,
	logger;

var index = function (req, res) {
	console.log('index list');
	User.find({
		title: /title/
	}).exec(function (err, items) {
		console.log('model search');
		if (err) {
			res.send(err);
		}
		else {
			res.send(items);
		}
	});
};

var show = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'author/show',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.user.username
					},
					author: CoreUtilities.removePrivateInfo(req.controllerData.user),
					user: CoreUtilities.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var showProfile = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'author/profile',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: req.controllerData.user.username
					},
					author: CoreUtilities.removePrivateInfo(req.controllerData.user),
					docs: req.controllerData.searchdocuments,
					user: CoreUtilities.removePrivateInfo(req.user)
				}
			});
		}
	);
};


var create = function (req, res) {
	var newuser = CoreUtilities.removeEmptyObjectValues(req.body),
		err = User.checkValidation({
			newuser: newuser,
			checkpassword: true
		});

	if (err) {
		CoreController.handleDocumentQueryErrorResponse({
			err: err,
			res: res,
			req: req
		});
	}
	else {
		userHelper.createNewUser({
			userdata: newuser,
			User: User,
			res: res,
			req: req,
			skiplogin: true,
			applicationController: CoreController
		});
	}
};

var update = function (req, res) {
	var bcrypt = require('bcrypt'),
		updateuser = CoreUtilities.removeEmptyObjectValues(req.body),
		err;
	if ((updateuser.activated || updateuser.accounttype || updateuser.userroles) && !User.hasPrivilege(req.user, 760)) {
		err = new Error('EXT-UAC760: You don\'t have access to modify user access');
	}
	if (updateuser.password) {
		if (updateuser.password !== updateuser.passwordconfirm) {
			err = new Error('Passwords do not match');
		}
		else if (updateuser.password === undefined || updateuser.password.length < 8) {
			err = new Error('Password is too short');
		}
		else {
			var salt = bcrypt.genSaltSync(10),
				hash = bcrypt.hashSync(updateuser.password, salt);
			updateuser.password = hash;
		}
	}
	if (updateuser.username && (updateuser.username === undefined || updateuser.username.length < 4)) {
		err = new Error('Username is too short');
	}
	if (updateuser.email && (updateuser.email === undefined || updateuser.email.match(/^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i) === null)) {
		err = new Error('Invalid email');
	}
	if (!updateuser.primaryasset && updateuser.assets && updateuser.assets.length > 0) {
		updateuser.primaryasset = updateuser.assets[0];
	}

	if (err) {
		CoreController.handleDocumentQueryErrorResponse({
			err: err,
			res: res,
			req: req
		});
	}
	else {
		CoreController.updateModel({
			cached: req.headers.periodicCache !== 'no-periodic-cache',
			model: User,
			id: updateuser.docid,
			updatedoc: updateuser,
			// saverevision: true,
			// population: 'contenttypes',
			res: res,
			req: req,
			successredirect: '/p-admin/user/' + updateuser.username + '/edit/',
			appendid: true
		});
	}
};

var remove = function (req, res) {
	var userprofile = req.controllerData.user;

	if (!User.hasPrivilege(req.user, 950)) {
		CoreController.handleDocumentQueryErrorResponse({
			err: new Error('EXT-UAC950: You don\'t have access to delete users'),
			res: res,
			req: req
		});
	}
	else {
		CoreController.deleteModel({
			cached: req.headers.periodicCache !== 'no-periodic-cache',
			model: User,
			deleteid: userprofile._id,
			req: req,
			res: res,
			callback: function (err) {
				if (err) {
					CoreController.handleDocumentQueryErrorResponse({
						err: err,
						res: res,
						req: req
					});
				}
				else {
					CoreController.handleDocumentQueryRender({
						req: req,
						res: res,
						redirecturl: '/p-admin/users',
						responseData: {
							result: 'success',
							data: 'deleted'
						}
					});
				}
			}
		});
	}
};

var loadUser = function (req, res, next) {
	var params = req.params,
		population = 'assets coverimages primaryasset coverimage extensionattributes userroles',
		docid = params.id;

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	CoreController.loadModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		docid: docid,
		model: User,
		population: population,
		searchusername: true,
		callback: function (err, doc) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else if (doc) {
				req.controllerData.user = doc;
				next();
			}
			else {
				CoreController.handleDocumentQueryErrorResponse({
					err: new Error('invalid user request'),
					res: res,
					req: req
				});
			}
		}
	});
};

var loadUserForBrowseControllerContent = function (req, res, next) {
	req.params.entitytype = 'authors';
	req.params.entityItems = req.params.id;
	next();
};

var loadUsersWithCount = function (req, res, next) {
	req.headers.loadtagcount = true;
	next();
};

var loadUsersWithDefaultLimit = function (req, res, next) {
	req.query.limit = req.query.usersperpage || req.query.limit || 15;
	req.query.pagenum = (req.query.pagenum && req.query.pagenum >0) ? req.query.pagenum : 1;
	next();
};

var getUsersData = function(options){
	var parallelTask = {},
 		req = options.req,
		res = options.res,
 		pagenum = req.query.pagenum - 1,
		next = options.next,
		query = options.query,
		sort = req.query.sort,
		callback = options.callback,
		limit = req.query.limit || req.query.tagsperpage,
		offset = req.query.offset || (pagenum*limit),
		population = options.population,
		orQuery = options.orQuery,
    Userrole = mongoose.model('Userrole'),
		searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi'),
		parallelFilterTask = {};

	req.controllerData = (req.controllerData) ? req.controllerData : {};

	if(req.query.ids){
		var queryIdArray=[];
		if(Array.isArray(req.query.ids)){
			queryIdArray = req.query.ids;
		}
		else if(typeof req.query.ids ==='string'){
			queryIdArray = req.query.ids.split(',');
		}
		orQuery.push({
			'_id': {$in:queryIdArray}
		});
	}
	else if (req.query.search !== undefined && req.query.search.length > 0) {
		orQuery.push({
			title: searchRegEx
		}, {
			'name': searchRegEx
		});
	}

	parallelFilterTask.authors = function(cb){
		if(req.query.filter_authors){
			var authorsArray = (typeof req.query.filter_authors==='string') ? req.query.filter_authors.split(',') : req.query.filter_authors;

			User.find({'username':{$in:authorsArray}},'_id', function( err, userids){
				cb(err, userids);
			});
		}
		else{
			cb(null,null);
		}
	};

	parallelFilterTask.userroles = function(cb){
		if(req.query.filter_userroles){
			var userrolesArray = (typeof req.query.filter_userroles==='string') ? req.query.filter_userroles.split(',') : req.query.filter_userroles;

			Userrole.find({'name':{$in:userrolesArray}},'_id', function( err, userids){
				cb(err, userids);
			});
		}
		else{
			cb(null,null);
		}
	};

	async.parallel(
		parallelFilterTask,
		function(err,filters){
			if(err){
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else{
				if(filters.authors){
					var aarray =[];
					for(var w in filters.authors){
						aarray.push(filters.authors[w]._id);
					}
					orQuery.push({'authors':{$in:aarray}});
				}
				if(filters.userroles){
					var urarray =[];
					for(var q in filters.userroles){
						urarray.push(filters.userroles[q]._id);
					}
					orQuery.push({'userroles':{$in:urarray}});
				}
				if(req.query.filter_accounttype){
					var accounttypeArray = (typeof req.query.filter_accounttype==='string') ? req.query.filter_accounttype.split(',') : req.query.filter_accounttype;
					orQuery.push({'accounttype':{$in:accounttypeArray}});
				}
				if(req.query.filter_activated){
					orQuery.push({'activated': CoreUtilities.replaceBooleanStringObjectValues(req.query.filter_activated) });
				}

				if(orQuery.length>0){
					query = {
						$and: orQuery
					};
				}

				parallelTask.userscount = function(cb){
					if(req.headers.loadtagcount){
						User.count(query, function( err, count){
							cb(err, count);
						});
					}
					else{
						cb(null,null);
					}
				};
				parallelTask.usersquery = function(cb){
					CoreController.searchModel({
						cached: req.headers.periodicCache !== 'no-periodic-cache',
						model: User,
						query: query,
						sort: sort,
						limit: limit,
						offset: offset,
						population: population,
						callback: function (err, documents) {
							cb(err,documents);
						}
					});
				};

				async.parallel(
					parallelTask,
					function(err,results){
						if(err){
							CoreController.handleDocumentQueryErrorResponse({
								err: err,
								res: res,
								req: req
							});
						}
						else{
							// console.log(results);
							req.controllerData.users = results.usersquery;
							req.controllerData.userscount = results.userscount;
							if(callback){
								callback(req, res);
							}
							else{
								next();								
							}
						}
				});	
			}
	});
};


var loadUsers = function (req, res, next) {
	var query,
		offset = req.query.offset,
		sort = req.query.sort,
		limit = req.query.limit,
		// population = 'contenttypes collections authors primaryauthor',
		searchRegEx = new RegExp(CoreUtilities.stripTags(req.query.search), 'gi');

	req.controllerData = (req.controllerData) ? req.controllerData : {};
	if (req.query.search === undefined || req.query.search.length < 1) {
		query = {};
	}
	else {
		query = {
			$or: [{
				title: searchRegEx
			}, {
				'name': searchRegEx
			}]
		};
	}

	CoreController.searchModel({
		cached: req.headers.periodicCache !== 'no-periodic-cache',
		model: User,
		query: query,
		sort: sort,
		limit: limit,
		offset: offset,
		// population:population,
		callback: function (err, documents) {
			if (err) {
				CoreController.handleDocumentQueryErrorResponse({
					err: err,
					res: res,
					req: req
				});
			}
			else {
				req.controllerData.users = documents;
				next();
			}
		}
	});
};

var searchResults = function (req, res) {
	CoreController.getPluginViewDefaultTemplate({
			viewname: 'search/index',
			themefileext: appSettings.templatefileextension
		},
		function (err, templatepath) {
			CoreController.handleDocumentQueryRender({
				res: res,
				req: req,
				renderView: templatepath,
				responseData: {
					pagedata: {
						title: 'User Search Results'
					},
					users: req.controllerData.users,
					user: CoreUtilities.removePrivateInfo(req.user)
				}
			});
		}
	);
};

var controller = function (resources) {
	logger = resources.logger;
	mongoose = resources.mongoose;
	appSettings = resources.settings;
	User = mongoose.model('User');
	CoreController = new ControllerHelper(resources);
	CoreUtilities = new Utilities(resources);
	userHelper = require(path.join(process.cwd(), 'app/controller/helpers/user'))(resources);

	return {
		show: show,
		index: index,
		create: create,
		update: update,
		remove: remove,
		loadUser: loadUser,
		loadUsers: loadUsers,
		loadUsersWithDefaultLimit: loadUsersWithDefaultLimit,
		loadUsersWithCount: loadUsersWithCount,
		showProfile: showProfile,
		loadUserForBrowseControllerContent:loadUserForBrowseControllerContent,
		getUsersData: getUsersData,
		searchResults: searchResults
	};
};

module.exports = controller;