'use strict';
/*jshint expr: true*/

var path    = require('path'),
    app     = require(path.resolve(process.cwd(), 'app/lib/periodic.js')),
    chai    = require('chai'),
    expect  = require('chai').expect,
    context = describe,
    request = require('supertest');

function getCookie(res) {
  return res.headers['set-cookie'][0].split(';')[0];
}

describe('the default route when no modules are installed', function(){
  before(function(done){
    app = app().app;
    done();
  });

  context('GET /', function(){
    it('should show the views/home page', function(done){
      request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<p>Periodic is an enterprise information and content management system, designed to quickly implement your own information architecture.<\/p>/)
      .end(done)
    });
    it('should respond with 404', function(done){
      request(app)
      .get('/missing')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<p>page: missing <\/p>/)
      .expect(404,done)
    });
  });
});


