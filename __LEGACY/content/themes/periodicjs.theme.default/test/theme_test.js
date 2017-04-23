'use strict';
/*jshint expr: true*/

var expect     = require('chai').expect,
    context    = describe,
    path = require('path'),
    Config = require(path.resolve(process.cwd(), 'app/lib/config.js')),
    periodic_configuration = new Config({env:'test'}).settings(),
    supertest  = require('supertest'),
    request  = supertest('http://localhost:'+periodic_configuration.application.port),
    requestagent  = require('superagent');
describe('the default theme routes', function(){
  this.timeout(5000);
  context('GET /', function (){
    it('should respond with 200 on home page with superagent', function (done){
      requestagent
        .get('http://localhost:'+periodic_configuration.application.port)
        .end(function(err,res){
          expect(res.text).to.be.a('string');
          expect(err).to.be.a('null');
          done();
        });
    });
    it('should respond with 200 on home page with supertest', function (done){
      request
        .get('/')
        .expect(200,done);
    });
  });
});
