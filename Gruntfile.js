/*
 * manuscript
 * http://github.com/typesettin/manuscript
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */
'use strict';
var path = require('path');

module.exports = function(grunt) {
	grunt.initConfig({
		jsbeautifier: {
			files: ["<%= jshint.all %>"],
			options: {
				js: {
					braceStyle: "collapse",
					breakChainedMethods: false,
					// e4x: false,
					// evalCode: false,
					indentChar: " ",
					// indentLevel: 0,
					indentSize: 2,
					indentWithTabs: true,
					// jslintHappy: false,
					keepArrayIndentation: true,
					keepFunctionIndentation: true,
					maxPreserveNewlines: 10,
					preserveNewlines: true,
					spaceBeforeConditional: false,
					spaceInParen: false,
					// unescapeStrings: false,
					// wrapLineLength: 0
				}
			},
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
        'content/extensions/node_modules/**/contoller/*.js',
        'content/extensions/node_modules/**/resources/*.js',
        '!content/extensions/node_modules/**/node_modules/**/*.js'
        // 'content/extensions/node_modules/periodicjs.ext.admin/index.js',
        // 'content/extensions/node_modules/periodicjs.ext.dbseed/contoller/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.dbseed/index.js',
        // 'content/extensions/node_modules/periodicjs.ext.default_routes/contoller/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.default_routes/index.js',
        // 'content/extensions/node_modules/periodicjs.ext.install/resources/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.install/contoller/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.install/index.js',
        // 'content/extensions/node_modules/periodicjs.ext.login/contoller/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.login/index.js',
        // 'content/extensions/node_modules/periodicjs.ext.mailer/contoller/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.mailer/index.js',
        // 'content/extensions/node_modules/periodicjs.ext.scheduled_content/index.js',
        // 'content/extensions/node_modules/periodicjs.ext.user_access_control/contoller/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.user_access_control/model/*.js',
        // 'content/extensions/node_modules/periodicjs.ext.user_access_control/index.js'
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
					dest: 'public/extensions',
					rename: function(dest, src) {
						var finallocation = path.join(dest, src);
						finallocation = finallocation.replace("_src", "");
						finallocation = finallocation.replace("resources", "");
						finallocation = path.resolve(finallocation);
						console.log("dest", dest, "src", src, "finallocation", finallocation);
						return finallocation;
					}
        }],
				options: {
					// transform: ['coffeeify']
				}
			}
		},
		uglify: {
			my_target: {
				options: {
					sourceMap: true,
					sourceMapName: 'public/scripts/index-sourcemap.map'
				},
				files: {
					'public/scripts/index.min.js': ['public/scripts/index.js']
				}
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
					"public/styles/manuscript.css": ['client/stylesheets/**/*.less'],
				}
			}
		},
		cssmin: {
			combine: {
				files: {
					'public/styles/manuscript.min.css': ['public/styles/manuscript.css']
				}
			}
		},
		// imagemin: {                          // Task
		//   dynamic: {                         // Another target
		//     options: {                       // Target options
		//       optimizationLevel: 7
		//     },
		//     files: [{
		//       expand: true,                  // Enable dynamic expansion
		//       cwd: 'src/',                   // Src matches are relative to this path
		//       src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
		//       dest: 'dist/'                  // Destination path prefix
		//     }]
		//   }
		// },
		watch: {
			scripts: {
				files: ["<%= jshint.all %>"],
				tasks: ['lint', 'packagejs', 'doc', 'css', 'test', 'less'],
				options: {
					interrupt: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-jsbeautifier');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-newer');

	grunt.registerTask('default', ['lint', 'browserify', 'doc', 'cssmin', 'uglify', 'test', 'less']);
	grunt.registerTask('lint', ['newer:jshint', 'newer:jsbeautifier']);
	grunt.registerTask('test', 'newer:simplemocha');
	grunt.registerTask('packagejs', 'newer:browserify');
	grunt.registerTask('minjs', 'newer:uglify');
	grunt.registerTask('css', 'newer:less');
	grunt.registerTask('doc', 'newer:jsdoc');
};
