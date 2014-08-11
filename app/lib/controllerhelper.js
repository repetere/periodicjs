/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';
var fs = require('fs-extra'),
	path = require('path'),
	nodemailer = require('nodemailer');

var getTransport = function (options) {
	var callback = options.callback,
		appenvironment = options.environment,
		transportJsonFile = path.resolve(process.cwd(), 'content/extensions/node_modules/periodicjs.ext.mailer/transport.json'),
		transportObject = {
			transportType: 'direct',
			transportOptions: {
				debug: true
			}
		};

	fs.readJson(transportJsonFile, function (err, transportJSON) {
		if (err) {
			callback(err, null);
		}
		else {
			if (transportJSON[appenvironment]) {
				transportObject = transportJSON[appenvironment];
				callback(null, nodemailer.createTransport(transportObject.type, transportObject.transportoptions));
			}
			else {
				callback(new Error('Invalid transport configuration, no transport for env: ' + appenvironment), null);
			}
		}
	});
};

exports.getTransport = getTransport;
