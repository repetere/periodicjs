/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */
'use strict';

var argv = require('optimist').argv;
/**
 * @description the script that starts the periodic express application.
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @requires module:optimist
 */
if (argv.cli) {
	require('./app/lib/cli')(argv);
}
else {
	/**
	 * @description periodic express application
	 * @instance express app
	 * @global
	 * @type {object}
	 */
	var periodic = require('./app/lib/periodic')();
	periodic.app.listen(periodic.port);
}
