/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

const deploy_sync = require('./npm_deploymentsync');
const Utilities = require('periodicjs.core.utilities');
const CoreUtilities = new Utilities({});

deploy_sync.deploy_sync_promise()
	.then((result)=>{
		console.log('Syncronized Periodic Dependencies',result);
		CoreUtilities.restart_app({});
		process.exit(0);	
	})
	.catch((e)=>{
		console.error('Could not run deply sync');
		console.error(e,e.stack);
		process.exit(0);
	});