'use strict';
/*jshint expr: true*/
var path = require('path'),
  Config = require(path.resolve(process.cwd(), 'app/lib/config.js')),
  chai = require('chai'),
  expect = require('chai').expect,
  defaultPath,
  configuration = new Config({env:'test'});
  chai.use(require('@yawetse/chai-fs'));


describe('A module that loads configurations for express and periodic', function () {
  describe('The config object', function () {
    it('should be an object', function (done) {
      expect(configuration).to.be.an('object');
      done();
    });
    it('should have an intial json config file', function (done) {
      defaultPath = configuration.getConfigFilePath('default');
      expect(defaultPath).to.be.a.file().and.not.empty;
      done();
    });
    it('should be able to read json config files', function (done) {
      defaultPath = configuration.getConfigFilePath('default');
      var envPath = configuration.getConfigFilePath('development');
      expect(defaultPath).to.be.a.file().with.json;
      expect(envPath).to.be.a.file().with.json;
      done();
    });
    it('should give you a method to set a config setting', function (done) {
      configuration.setConfig('hello', 'world');
      expect(configuration).to.have.property('hello');
      done();
    });
    it('should get its version from the package json file', function (done) {
      expect(configuration.version).to.not.eql('1.0.0');
      done();
    });
    // it('should be debuggable', function (done) {
    //   let debugtest = new Config({env:'test',debug:true});

    //   expect(debugtest.settings().debug).to.be.true;
    //   done();
    // });
    // it('should be take cli configurations', function (done) {
    //   process.argv.push('e=configtest');
    //   let processenvtest = new Config({});

    //   expect(processenvtest.settings().application.environment).to.equal('configtest');
    //   done();
    // });
    it('should be take runtime from runtime.json', function (done) {
      let runtimetest = new Config({
        lastRuntimeEnvironmentFilePath:path.join(__dirname,'config_spec_runtime.json'),
        env: 'testruntime' //this should be read from the file, but gets overidden by json file
      });

      expect(runtimetest.settings().application.environment).to.equal('development');
      done();
    });
    it('should be take process env configurations', function (done) {
      process.env.NODE_ENV = 'test';
      let processenvtest = new Config({env:'test',debug:true});

      expect(processenvtest.settings().application.environment).to.equal('test');
      done();
    });
  });
});
