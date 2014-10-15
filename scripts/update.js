/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs-extra'),
		path = require('path'),
		upgradeinstall = typeof process.env.npm_config_upgrade_install_periodic ==='string' ||  typeof process.env.npm_config_update ==='string',
		upgradeinstallalias = typeof process.env.npm_config_upgrade ==='string',
		nodemoduleinstall = typeof process.env.npm_config_install_node_module ==='string',
		originalnodemoduleslocation = path.resolve(process.cwd(),'../../node_modules'),
		originallocation = path.resolve(process.cwd(),'../../node_modules','periodicjs'),
		newlocation = path.resolve(process.cwd(),'../../periodicjs'),
		npmhelper = require('./npmhelper')({
			originalnodemoduleslocation : originalnodemoduleslocation,
			originallocation : originallocation,
			newlocation : newlocation
		});

console.log('process.cwd()',process.cwd());
console.log('originalnodemoduleslocation',originalnodemoduleslocation);
console.log('originallocation',originallocation);
console.log('newlocation',newlocation);
