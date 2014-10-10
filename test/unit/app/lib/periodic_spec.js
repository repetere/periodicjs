var path = require('path'),
    periodicjs = require(path.resolve(process.cwd(),'app/lib/periodic.js')),
    chai = require('chai'),
    expect = require('chai').expect;
    chai.use(require('chai-fs'));

'use-strict'

describe('A module that represents a periodic app',function () {

  describe('The periodic object',function () {
    it('should return an object',function (done) {
      expect( periodicjs() ).to.be.an('object');
      done();
    });

    it('should have the need config properties', function (done) {
      var periodicConf = periodicjs;
      expect(periodicConf).to.have.property('name');
      done();
    });

    it('uses express methods',function () {
      console.log( periodicjs().init.loadConfiguration() )
      console.log( periodicjs().app.get('env') )
      expect(periodicjs).to.be.ok();
    });
  });
});
