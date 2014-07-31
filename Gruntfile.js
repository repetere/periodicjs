'use strict';
/*
 * manuscript
 * http://github.com/typesettin/manuscript
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

var path = require('path');

module.exports = function (grunt) {
	grunt.initConfig({
		jsbeautifier: {
			files: ['<%= jshint.all %>'],
			options: {
				config: '.jsbeautify'
			}
		},
		simplemocha: {
			options: {
				globals: ['should', 'navigator'],
				timeout: 3000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'spec'
			},
			all: {
				src: 'test/**/*.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'index.js',
				'app/**/*.js',
				'!app/doc/**/*.js',
				'test/**/*.js',
				'package.json',
				'config/**/*.js',
				'content/extensions/node_modules/**/index.js',
				'content/extensions/node_modules/**/contoller/**/*.js',
				'content/extensions/node_modules/**/resources/*.js',
				'!content/extensions/node_modules/**/node_modules/**/*.js'
			]
		},
		jsdoc: {
			dist: {
				src: ['app/lib/*.js', 'test/*.js'],
				options: {
					destination: 'app/doc/html',
					configure: 'app/config/jsdoc.json'
				}
			}
		},
		browserify: {
			dist: {
				files: [{
					expand: true,
					cwd: 'content/extensions/node_modules',
					src: ['**/resources/js/*_src.js'],
					dest: 'content/extensions/node_modules',
					rename: function (dest, src) {
						var finallocation = path.join(dest, src);
						finallocation = finallocation.replace('_src', '_build');
						finallocation = finallocation.replace('resources', 'public');
						finallocation = path.resolve(finallocation);
						return finallocation;
					}
				}],
				options: {}
			}
		},
		uglify: {
			options: {
				sourceMap: true,
				compress: {
					drop_console: false
				}
			},
			all: {
				files: [{
					expand: true,
					cwd: 'content/extensions/node_modules',
					src: ['**/public/js/*_build.js'],
					dest: 'content/extensions/node_modules',
					rename: function (dest, src) {
						var finallocation = path.join(dest, src);
						finallocation = finallocation.replace('_build', '.min');
						finallocation = path.resolve(finallocation);
						return finallocation;
					}
				}]
			}
		},
		less: {
			development: {
				options: {
					sourceMap: true,
					yuicompress: true,
					compress: true
				},
				files: {
					'public/styles/default/periodic.css': ['public/styles/default/periodic.less']
				}
			}
		},
		copy: {
			main: {
				files: [{
					expand: true,
					cwd: 'content/extensions/node_modules',
					src: ['**/public/**/*.*', '!**/node_modules/**/*.*'],
					// src: ['**/public/**/*.*', '!**/public/**/*_build.js', '!**/node_modules/**/*.*'],
					dest: 'public/extensions/',
					rename: function (dest, src) {
						var finallocation = path.join(dest, src.replace('public', ''));
						// finallocation = finallocation;
						finallocation = path.resolve(finallocation);
						// console.log("dest", dest, "src", src, "finallocation", finallocation);
						return finallocation;
					}
				}]
			}
		},

		/*
		cssmin: {
			combine: {
				files: {
					'public/styles/manuscript.min.css': ['public/styles/manuscript.css']
				}
			}
		},
		imagemin: {                          // Task
		  dynamic: {                         // Another target
		    options: {                       // Target options
		      optimizationLevel: 7
		    },
		    files: [{
		      expand: true,                  // Enable dynamic expansion
		      cwd: 'src/',                   // Src matches are relative to this path
		      src: ['**\/*.{png,jpg,gif}'],   // Actual patterns to match
		      dest: 'dist/'                  // Destination path prefix
		    }]
		  }
		},
		copy: {
			vendor_fonts: {
				files: [
					// includes files within path
					{
						expand: true,
						cwd: 'app/vendor/',
						src: ['**\/*'],
						dest: 'dist/vendor/'
					}, {
						expand: true,
						cwd: 'app/fonts/',
						src: ['**\/*'],
						dest: 'dist/fonts/'
					}
				]
			},
			spec: {
				expand: true,
				cwd: 'app/scripts',
				nonull: true,
				src: ['**\/*.js', '!bundle.js'],
				dest: 'test/unit/',
				filter: function (filepath) { //look in test/unit to see if spec already exists. Return TRUE to make new file	(files does not exist)
					var dest = path.join(
						grunt.config('copy.spec.dest'),
						path.basename(filepath, '.js') + '_spec.js'
					);
					var doesFileExist = grunt.file.exists(dest);
					return !(doesFileExist);
				},
				rename: function (dest, src) {
					var src_spec = path.basename(src, '.js') + "_spec.js"
					return dest + src_spec;
				},
				options: {
					process: function (content, srcpath) { //between copy 
						console.log("STARTING Replace", " ", srcpath);
						var varName = path.basename(srcpath, '.js');
						var require = "var " + varName + " = " + "require('" + '../../' + srcpath + "');";
						return require;
					}
				}
			}
		},
		plato: {
			lint: {
				options: {
					jshint: grunt.file.readJSON('.jshintrc'),
					dir: "reports",
					title: grunt.file.readJSON('package.json').name,
					complexity: {
						minmi: true,
						forin: true,
						logicalor: false
					}
				},
				files: {
					'reports': ['app/scripts/**\/*.js']
				}
			},
		},
		mocha_istanbul: {
			coverage: {
				src: 'test/unit',
				options: {
					check: {
						lines: 75,
						statements: 75,
						branches: 75,
						functions: 75
					},
					mask: '*.js',
					instrument: ['test'],
					coverageFolder: "reports/coverage",
					reporter: "html-cov",
					ui: 'bdd',
					root: 'app/scripts/',
					print: 'summary',
					excludes: ['node_modules', 'dist']
				}
			}
		},
		casperjs: {
			options: {
				async: {
					parrallel: true
				}
			},
			files: {
				src: ['test/intergration/**\/*.js']
			}
		},
		*/
		watch: {
			options: {
				interrupt: true
			},
			css: {
				files: ['public/stylesheets/**/*.less'],
				tasks: ['newer:less']
			},
			js: {
				files: ['<%= jshint.all %>', 'content/extensions/node_modules/**/resources/**/*.js'],
				tasks: ['newer:simplemocha:all', 'newer:jshint:all', 'newer:jsbeautifier', 'newer:browserify', 'newer:uglify:all', 'newer:copy:main']
			}
		}
	});

	// Loading dependencies
	for (var key in grunt.file.readJSON('package.json').devDependencies) {
		if (key.indexOf('grunt') === 0 && key !== 'grunt') {
			grunt.loadNpmTasks(key);
		}
	}

	grunt.registerTask('default', ['lint', 'browserify', 'doc', 'cssmin', 'uglify', 'test', 'less']);
};
