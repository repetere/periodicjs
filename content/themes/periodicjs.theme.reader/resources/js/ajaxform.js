'use strict';

var request = require('superagent'),
	formobj = require('./formtoobject');

var ajaxFormCallback = function (error, res, f) {
	// console.log('error', error);
	// console.log('res', res);
	var errorfn;
	if (f.getAttribute('data-errorfunction')) {
		var errorFunctionString = f.getAttribute('data-errorfunction');
		errorfn = window[errorFunctionString];
	}


	if (res && res.body && res.body.result === 'error') {
		// window.ribbonNotification.showRibbon(res.body.data.error, 4000, 'error');
		if (typeof errorfn === 'function') {
			errorfn(res.body.data.error);
		}
	}
	else if (res && res.clientError) {
		// window.ribbonNotification.showRibbon(res.status + ': ' + res.text, 4000, 'error');
		if (typeof errorfn === 'function') {
			errorfn(res.status + ': ' + res.text);
		}
	}
	else if (error) {
		// window.ribbonNotification.showRibbon(error.message, 4000, 'error');
		if (typeof errorfn === 'function') {
			errorfn(error.message);
		}

	}
	else {
		// window.ribbonNotification.showRibbon('saved', 4000, 'success');
		if (f.getAttribute('data-successfunction')) {
			var successFunctionString = f.getAttribute('data-successfunction'),
				successfn = window[successFunctionString];
			// is object a function?
			if (typeof successfn === 'function') {
				successfn(res.body, false);
			}
		}
	}
};

var ajaxPostFormSubmit = function (e, element, issearching) {
	console.log('issearching', issearching);
	if (e) {
		e.preventDefault();
	}
	var f = (element) ? element : e.target;
	if (f.getAttribute('data-beforesubmitfunction')) {
		var beforesubmitFunctionString = f.getAttribute('data-beforesubmitfunction'),
			beforefn = window[beforesubmitFunctionString];
		// is object a function?
		if (typeof beforefn === 'function') {
			beforefn(e);
		}
	}
	var formData = new formobj(f);
	if ((typeof issearching === 'boolean' && issearching === false) || typeof issearching === 'undefined') {
		request
			.post(f.action)
			.set('x-csrf-token', document.querySelector('input[name=_csrf]').value)
			.set('Accept', 'application/json')
			.query({
				format: 'json'
			})
			.send(formData)
			.end(function (err, res) {
				ajaxFormCallback(err, res, f);
			});
	}
};

var ajaxGetFormSubmit = function (e, element, issearching) {
	console.log('issearching', issearching);
	if (e) {
		e.preventDefault();
	}
	var f = (element) ? element : e.target;
	if (f.getAttribute('data-beforesubmitfunction')) {
		var beforesubmitFunctionString = f.getAttribute('data-beforesubmitfunction'),
			beforefn = window[beforesubmitFunctionString];
		// is object a function?
		if (typeof beforefn === 'function') {
			beforefn(e);
		}
	}
	var formData = new formobj(f);
	formData.format = 'json';
	formData.limit = 15;
	if ((typeof issearching === 'boolean' && issearching === false) || typeof issearching === 'undefined') {
		request
			.get(f.action)
			.set('x-csrf-token', document.querySelector('input[name=_csrf]').value)
			.set('Accept', 'application/json')
			.query(formData)
			.end(function (err, res) {
				ajaxFormCallback(err, res, f);
			});
	}
};

module.exports.post = ajaxPostFormSubmit;
module.exports.get = ajaxGetFormSubmit;
