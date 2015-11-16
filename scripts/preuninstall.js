/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var fs = require('fs'),
		path = require('path'),
		extensionsConfigPath = path.join(process.cwd(),'/content/config/extensions.json'),
		appContentPath = path.join(process.cwd(),'/content/'),	
		appContentPathBackupDir = path.join(process.cwd(),'../periodic_content_backup/'),
		publicPath = path.join(process.cwd(),'/public/'),	
		publicPathBackupDir = path.join(process.cwd(),'../periodic_public_backup/'),
		async,
		fs_extra,
		hasfsextra = false;

// console.log('preuninstall.js process.cwd()',process.cwd());
// console.log('preuninstall.js __dirname',__dirname);
// console.log('preuninstall.js extensionsConfigPath',extensionsConfigPath);
// console.log('preuninstall.js appContentPath',appContentPath);
// console.log('preuninstall.js appContentPathBackupDir',appContentPathBackupDir);
// console.log('preuninstall.js publicPath',publicPath);
// console.log('preuninstall.js publicPathBackupDir',publicPathBackupDir);
// console.log('path.join(process.cwd(),node_modules/async)',path.join(process.cwd(),'node_modules/async'));

try{
	async = require(path.join(process.cwd(),'node_modules/async'));
	// console.log('async',async);
	fs_extra = require(path.join(process.cwd(),'node_modules/fs-extra'));
	hasfsextra = true;
	console.log(' already installed and has async and fs-extra');
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
				console.log('created appContentPath backup',result);
			}
			process.exit(0);
	});
}
catch(e){
	console.log('not already installed',e);
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
