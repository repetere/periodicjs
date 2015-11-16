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
		customFilesPath = path.join(process.cwd()),	
		customFilesPathBackupDir = path.join(process.cwd(),'../periodic_customfiles_backup/'),
		async,
		fs_extra,
		hasfsextra = false;

// console.log('preuninstall.js process.cwd()',process.cwd());
// console.log('preuninstall.js __dirname',__dirname);
// console.log('preuninstall.js extensionsConfigPath',extensionsConfigPath);
// console.log('preuninstall.js appContentPath',appContentPath);
// console.log('preuninstall.js appContentPathBackupDir',appContentPathBackupDir);
// console.log('preuninstall.js customFilesPath',customFilesPath);
// console.log('preuninstall.js customFilesPathBackupDir',customFilesPathBackupDir);
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
			},
			copy_custom_files:	function(asyncCB){
				fs_extra.copy(customFilesPath,customFilesPathBackupDir,{
					filter:function(file){
						// console.log('file',file);
						if(file.match(/node_modules\/periodicjs\/app/gi) ||
							file.match(/node_modules\/periodicjs\/.DS_Store/gi) ||
							// file.match(/node_modules\/periodicjs\/.gitignore/gi) ||
							file.match(/node_modules\/periodicjs\/.gitmodules/gi) ||
							file.match(/node_modules\/periodicjs\/.jsbeautify/gi) ||
							file.match(/node_modules\/periodicjs\/.jshintrc/gi) ||
							file.match(/node_modules\/periodicjs\/.npmignore/gi) ||
							file.match(/node_modules\/periodicjs\/.travis.yml/gi) ||
							file.match(/node_modules\/periodicjs\/.jsbeautify/gi) ||
							file.match(/node_modules\/periodicjs\/AUTHORS/gi) ||
							file.match(/node_modules\/periodicjs\/LICENSE/gi) ||
							file.match(/node_modules\/periodicjs\/README.md/gi) ||
							file.match(/node_modules\/periodicjs\/Changelog/gi) ||
							file.match(/node_modules\/periodicjs\/Gruntfile.js/gi) ||
							file.match(/node_modules\/periodicjs\/cache/gi) ||
							file.match(/node_modules\/periodicjs\/content/gi) ||
							file.match(/node_modules\/periodicjs\/doc/gi) ||
							file.match(/node_modules\/periodicjs\/etc/gi) ||
							file.match(/node_modules\/periodicjs\/index.js/gi) ||
							file.match(/node_modules\/periodicjs\/jsdoc.json/gi) ||
							file.match(/node_modules\/periodicjs\/logs/gi) ||
							file.match(/node_modules\/periodicjs\/etc/gi) ||
							file.match(/node_modules\/periodicjs\/node_modules/gi) ||
							file.match(/node_modules\/periodicjs\/processes/gi) ||
							file.match(/node_modules\/periodicjs\/public/gi) ||
							file.match(/node_modules\/periodicjs\/test/gi) ||
							file.match(/node_modules\/periodicjs\/releases/gi) ||
							file.match(/node_modules\/periodicjs\/scripts/gi) ||
							file.match(/node_modules\/periodicjs\/runforever.sh/gi) ||
							file.match(/node_modules\/periodicjs\/package.json/gi) ||
							file.match(/node_modules\/periodicjs\/nodemon.json/gi)){
							return false;
						}
						else{
							return true;
						}
					}
				},asyncCB);
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
