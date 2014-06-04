'use strict';

var path = require('path'),
	fs = require('fs');

var applicationController = function(resources){
	var logger = resources.logger;
	var theme = resources.settings.theme;
	// logger.info(resources);
	// this.attr = true;
	function isValidObjectID(str) {
		// coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
		str = str + '';
		var len = str.length,
			valid = false;
		if (len === 12 || len === 24) {
			valid = /^[0-9a-fA-F]+$/.test(str);
		}
		return valid;
	}

	this.getViewTemplate = function(options){
		var callback = options.callback,
			templatetype = options.templatetype,
			id = options.id,
			templatepath = 'home/index';

		console.log("id finish loading tempalte view");

		switch(templatetype){
			case 'post-single':
				callback('post/single');
				break;
			default:
				callback(templatepath);
				break;
		}
	};

	this.loadModel = function(options) {
		var model = options.model,
			docid = options.docid,
			callback = options.callback;

		if (isValidObjectID(docid)) {
			model.findOne({
				$or: [{
				name: docid
				}, {
				_id: docid
				}]
			},
			function(err,doc){
				callback(err,doc);
			});
		}
		else {
			model.findOne({
				name: docid
			},
			function(err,doc){
				callback(err,doc);
			});
		}
	};

	this.handleDocumentQueryRender = function(options){
		var res = options.res,
			req = options.req;
		if(req.query.format === "json") {
			res.send(options.responseData);
		}
		else{
			res.render(options.renderView,options.responseData);
		}
	};

	this.handleDocumentQueryErrorResponse = function(options){
		var err = options.err,
			redirectUrl = options.redirectUrl,
			req = options.req,
			res = options.req,
			callback = options.callback;

		if(req.query.format === "json") {
			res.send({
				"result": "error",
				"data": {
					error: err
				}
			});
		}
		else {
			if(options.flashError){
				req.flash('error', options.errorFlash);
			}
			if(callback){
				callback();
			}
			else if(redirectUrl){
				res.redirect(redirectUrl);
			}
			else{
				res.redirect('/404');
			}
		}
	};
};

module.exports = applicationController;