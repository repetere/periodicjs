'use strict';
/*
 * manuscript
 * http://github.com/typesettin/manuscript
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

var path = require('path'),
	Config = require('./app/lib/config'),
	config = new Config(),
	fs = require('fs-extra'),
	themename = config.settings().theme,
	testPaths = [];

if (typeof themename === 'string') {
	try {
		var themePath = path.join(__dirname, './content/themes/' + themename + '/test');
		console.log(themePath);
		var dirResults = fs.readdirSync(themePath);
		if (dirResults instanceof Error) {
			throw dirResults;
		}
		else if (Array.isArray(dirResults)) {
			var themeTestPath = themePath + '/**/*.js';
			testPaths.push(themeTestPath);
		}
	}
	catch (e) {
		console.log('Theme test path does not exist', e);
	}
}

var periodicTestPath = path.join(__dirname, './test') + '/**/*.js';
testPaths.unshift(periodicTestPath);

module.exports = function (grunt) {
	grunt.initConfig({
		jsbeautifier: {
			files: ['<%= jshint.all %>'],
			options: {
				config: '.jsbeautify'
			}
		},
	  mocha_istanbul: {
      coverage: {
        src: testPaths, // a folder works nicely
        options: {
          	coverageFolder: 'coverage', // will check both coverage folders and merge the coverage results
        }
      },
      // coverageSpecial: {
      //   src: ['testSpecial/*/*.js', 'testUnique/*/*.js'], // specifying file patterns works as well
      //   options: {
      //       coverageFolder: 'coverageSpecial',
      //       mask: '*.spec.js',
      //       mochaOptions: ['--harmony','--async-only'], // any extra options
      //       istanbulOptions: ['--harmony','--handle-sigint']
      //   }
      // },
      coveralls: {
        src: testPaths, // multiple folders also works
        options: {
          coverage:true, // this will make the grunt.event.on('coverage') event listener to be triggered
          check: {
            lines: 5,
            branches: 5,
            functions: 5,
            statements: 5
          },
          // root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
          reportFormats: ['cobertura','lcovonly']
        }
      }
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage', // will check both coverage folders and merge the coverage results
          check: {
            lines: 80,
            branches: 80,
            functions: 80,
            statements: 80
          }
        }
      }
    },
    coveralls: {
    // Options relevant to all targets
	    options: {
	      // When true, grunt-coveralls will only print a warning rather than
	      // an error, to prevent CI builds from failing unnecessarily (e.g. if
	      // coveralls.io is down). Optional, defaults to false.
	      force: false
	    },

	    all: {
	      // LCOV coverage file (can be string, glob or array)
	      src: 'coverage/*.info',
	      options: {
	        // Any options for just this target
	      }
	    },
	  },
		simplemocha: {
			options: {
				globals: ['should', 'navigator','x'],
				timeout: 3000,
				ignoreLeaks: true,
				ui: 'bdd',
				reporter: 'spec'
			},
			all: {
				src: testPaths
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
				'config/**/*.js'
			]
		},
		jsdoc: {
			dist: {
				src: ['app/**/*.js', 'scripts/**/*.js', 'test/**/*.js', 'index.js'],
				options: {
					destination: 'doc/html',
					configure: 'jsdoc.json'
				}
			}
		},
		browserify: {
			dist: {
				files: [{
					expand: true,
					cwd: 'scripts',
					src: ['resources/js/*_src.js'],
					dest: 'node_modules',
					rename: function (dest, src) {
						var finallocation = path.join(dest, src);
						finallocation = finallocation.replace('_src', '_build');
						finallocation = finallocation.replace('resources', 'public');
						finallocation = path.resolve(finallocation);
						return finallocation;
					}
				}],
				options: {}
			},
			extension_resources: {
				files: [{
					expand: true,
					cwd: 'node_modules',
					src: ['periodicjs*/resources/js/*_src.js'],
					dest: 'node_modules',
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
					cwd: 'scripts',
					src: ['public/js/*_build.js'],
					dest: 'node_modules',
					rename: function (dest, src) {
						var finallocation = path.join(dest, src);
						finallocation = finallocation.replace('_build', '.min');
						finallocation = path.resolve(finallocation);
						return finallocation;
					}
				}]
			},
			extension_resources: {
				files: [{
					expand: true,
					cwd: 'node_modules',
					src: ['periodicjs*/public/js/*_build.js'],
					dest: 'node_modules',
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
					'public/stylesheets/default/periodic.css': 'public/stylesheets/default/periodic.less'
				}
			}
		},
		copy: {
			main: {
				files: [{
					expand: true,
					cwd: 'node_modules',
					src: ['periodicjs*/public/**/*.*', '!**/node_modules/**/*.*'],
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
		watch: {
			options: {
				interrupt: true
			},
			css: {
				files: ['public/stylesheets/**/*.less'],
				tasks: ['newer:less']
			},
			js: {
				files: ['<%= jshint.all %>'],
				tasks: ['newer:simplemocha:all', 'newer:jshint:all', 'newer:jsbeautifier', 'newer:browserify', 'newer:uglify:all', 'newer:copy:main', 'doc']
			}
		}
	});

	// Loading dependencies
	for (var key in grunt.file.readJSON('package.json').devDependencies) {
		if (key.indexOf('grunt') === 0 && key !== 'grunt') {
			grunt.loadNpmTasks(key);
		}
	}
	grunt.registerTask('doc', 'jsdoc');
	grunt.registerTask('test', 'mocha_istanbul');
	grunt.registerTask('lint', 'jshint');
	grunt.registerTask('default', ['lint', 'browserify', 'doc', 'uglify', 'test', 'less']);
};
