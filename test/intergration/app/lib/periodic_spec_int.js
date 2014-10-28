'use strict';
/*jshint expr: true*/

var path    = require('path'),
    periodicjs = require(
      path.resolve(process.cwd(), 'app/lib/periodic.js')
      )({waitformongo:true}),
    chai    = require('chai'),
    expect  = require('chai').expect,
    context = describe,
    request = require('supertest');

function getCookie(res) {
  return res.headers['set-cookie'][0].split(';')[0];
}

describe('the default route when no modules are installed', function(){
  this.timeout(5000);

  before(function(done){
    periodicjs.mongoose.connection.on('open',function(){
      done();
    });
  });

  context('GET /', function(){
    it('should show the views/home page', function(done){
      request(periodicjs.expressapp)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
       .expect(/Periodic is an enterprise information and content management system, designed to quickly implement your own information architecture./)
      .end(done)
    });
    it('should respond with 404', function(done){
      request(periodicjs.expressapp)
      .get('/missing')
      .expect('Content-Type', 'text/html; charset=utf-8')
       .expect(/Sorry page not found!/)
      .expect(404,done)
    });
  });
});
