/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */
'use strict';

var argv = require('optimist').argv;

if (argv.cli) {
	require('./app/lib/cli')(argv);
}
else {
	var periodic = require('./app/lib/periodic');
	periodic.app.listen(periodic.port);
}