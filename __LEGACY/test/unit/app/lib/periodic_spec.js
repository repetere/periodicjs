'use strict';
/*jshint expr: true*/
const path = require('path');
const periodic = require(path.resolve(__dirname, '../../../../app/lib/periodic.js'));
const periodicLib = periodic({
  skiprouting: true,
  env: 'test',
  port: 8010
});
const expect = require('chai').expect;

let periodicjs;

describe('A module that represents a periodic app',function (){
  this.timeout(10000);
  before('periodic_spec initialize periodic',function (done){
    periodicLib.init({},function (err,periodicInitialized){
      if(err){
        done(err);
      }
      else {
        periodicjs = periodicInitialized;
        done();
      }
    });
  });
  describe('The periodic object',function (){
    it('should return an object',function (done){
      expect(periodicjs).to.be.an('object');
      done();
    });

    it('should have the new config properties',function (done){
      var periodicConf = periodicjs.periodic.settings;
      expect(periodicConf).to.have.property('name');
      done();
    });

    it('uses express methods',function (){
      // console.log( periodicjs() )
      expect(periodicjs.expressapp.get('env')).to.eql(periodicjs.periodic.settings.application.environment);
    });
  });
});
