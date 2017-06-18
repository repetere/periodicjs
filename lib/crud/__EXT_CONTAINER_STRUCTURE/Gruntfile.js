'use strict';

const path = require('path');
const testPaths = ['./test/**/*.js',];

module.exports = function (grunt) {
  grunt.initConfig({
    mocha_istanbul: {
      coverage: {
        src: testPaths, // multiple folders also works
        reportFormats: ['cobertura', 'lcovonly',],
      },
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage', // will check both coverage folders and merge the coverage results
          check: {
            lines: 80,
            branches: 80,
            functions: 80,
            statements: 80,
          },
        },
      },
    },
    coveralls: {
    // Options relevant to all targets
      options: {
        // When true, grunt-coveralls will only print a warning rather than
        // an error, to prevent CI builds from failing unnecessarily (e.g. if
        // coveralls.io is down). Optional, defaults to false.
        force: false,
      },
      all: {
        // LCOV coverage file (can be string, glob or array)
        src: 'coverage/*.info',
        options: {
          // Any options for just this target
        },
      },
    },
    simplemocha: {
      options: {
        globals: ['should', 'navigator', 'x',],
        timeout: 3000,
        ignoreLeaks: true,
        ui: 'bdd',
        reporter: 'spec',
      },
      all: {
        src: testPaths,
      },
    },
    jsdoc: {
      dist: {
        src: ['lib/**/*.js', 'index.js',],
        options: {
          destination: 'doc/html',
          configure: 'jsdoc.json',
        },
      },
    },
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON('package.json').devDependencies) {
    if (key.indexOf('grunt') === 0 && key !== 'grunt') {
      grunt.loadNpmTasks(key);
    }
  }
  grunt.registerTask('doc', 'jsdoc');
  grunt.registerTask('test', 'mocha_istanbul');
  grunt.registerTask('default', [/*'lint',*/'test', /*'browserify',*/ 'doc', /*'uglify',*/ ]);
};