var path = require('path'),
    periodicjs = require(path.resolve(process.cwd(),'app/lib/periodic.js')),
    chai = require('chai'),
    expect = require('chai').expect;
    chai.use(require('chai-fs'));

'use-strict'

describe('A module that represents a periodic app',function () {

  // beforeEach(function () {
  //   periodic = periodicjs();
  // });

  describe('The periodic object',function () {
    it('should return an object',function (done) {
      expect( periodicjs() ).to.be.an('object');
      done();
    });

    it('should have the need config properties', function (done) {
      var periodicConf = periodicjs;
      console.log(periodicConf.init())
      expect(periodicConf).to.have.property('name');
      done();
    });
  });
});
