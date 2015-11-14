/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs'),
		path = require('path'),
		extensionsConfigPath = path.join(process.cwd(),'/node_modules/periodicjs/content/config/extensions.json'),
		appContentPath = path.join(process.cwd(),'/node_modules/periodicjs/content/'),	
		appContentPathBackupDir = path.join(process.cwd(),'/periodic_content_backup/'),
		publicPath = path.join(process.cwd(),'/node_modules/periodicjs/public/'),	
		publicPathBackupDir = path.join(process.cwd(),'/periodic_public_backup/'),
		async,
		fs_extra,
		hasfsextra = false;

try{
	fs_extra = require('fs-extra');
	async = require('async');
	hasfsextra = true;
	async.parallel({
			copy_content:	function(asyncCB){
				fs_extra.copy(appContentPath, appContentPathBackupDir,asyncCB);
			},
			copy_public:	function(asyncCB){
				fs_extra.copy(publicPath, publicPathBackupDir,asyncCB);
			}
		},function(err,result){
		  if (err){
				console.log('copying appContentPath backup error',err);
			}
			else{
				console.log('created extensions.json backup',result);
			}
			process.exit(0);
	});
}
catch(e){
	hasfsextra = false;
	fs.readFile(extensionsConfigPath,{encoding :'utf8'},function(err,filedata){
		if(err){
			console.log('reading extensions.json backup error',err);
			process.exit(0);
		}
		else{
			fs.writeFile(extensionsConfigPath+'.dat',filedata,function(err){
				if(err){
					console.log('writing extensions.json.dat backup error',err);
				}
				else{
					console.log('created extensions.json backup');
				}
				process.exit(0);
			});
		}
	});
}
