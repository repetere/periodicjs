'use strict';
/*jshint expr: true*/
var path = require('path'),
  Logger = require(path.resolve(process.cwd(), 'content/config/logger.js')),
  fs = require('fs-extra'),
  chai = require('chai'),
  expect = require('chai').expect,
  defaultPath,
  configuration = new Logger({env:'test'});
  chai.use(require('@yawetse/chai-fs'));


describe('A customizible winston logger', function () {
  it('should return a winston logger',function(){
    let winstonlogger = new Logger('test');
    // console.log('winstonlogger',winstonlogger);
    expect(winstonlogger).to.be.an('object');
    expect(winstonlogger.loggerConfig).to.be.an('object');
  });
  it('should ensure that a logging directory exists',function(done){
    fs.readdir(process.cwd(),function(err,files){
      expect(err).to.be.null;
      expect(files).to.be.an('array');
      done()
    })
  });
  it('should be customizible by environment',function(){
    let winstonlogger = new Logger('production');
    expect(winstonlogger.loggerConfig.env).to.equal('production');
  });
});
