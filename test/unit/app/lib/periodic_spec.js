var path = require('path'),
    periodicjs = require(path.resolve(process.cwd(),'app/lib/periodic.js')),
    chai = require('chai'),
    expect = require('chai').expect;
    chai.use(require('chai-fs'));

'use-strict'

describe('A module that represents a periodic app',function () {

  describe('The periodic object',function () {
    var periodic = periodicjs
    it('should return an object',function (done) {
      expect( periodic() ).to.be.an('object');
      done();
    });
    it('should have the need config properties', function (done) {
      done();
    });
  });
});
