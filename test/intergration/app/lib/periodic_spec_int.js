'use strict';
/*jshint expr: true*/

var path       = require('path'),
    periodicjs = require(path.resolve(process.cwd(), 'app/lib/periodic.js'))({waitformongo:true}),
    chai       = require('chai'),
    expect     = require('chai').expect,
    context    = describe,
    request    = require('supertest');

function getCookie(res) {
  return res.headers['set-cookie'][0].split(';')[0];
}

describe('the default routes when no modules are installed', function(){
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
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Periodic is an enterprise information and content management system, designed to quickly implement your own information architecture./)
      .expect(200,done)
    });
    it('should respond with 404 it given an unknown route', function(done){
      request(periodicjs.expressapp)
      .get('/missing')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/missing/)
      .expect(404,done);
    });
  });
  context('Get /articles',function() {
    it('should not have the route article installed', function(done){
      request(periodicjs.expressapp)
      .get('/articles')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/articles/)
      .expect(404,done);

    });
  });
  context('Get /user',function() {
    it('should not have a user route defined', function(done){
      request(periodicjs.expressapp)
      .get('/user')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/user/)
      .expect(404,done);
    });
  });
  context('Get /collections',function() {
    it('should not have a collections route defined', function(done){
      request(periodicjs.expressapp)
      .get('/collections')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/collections/)
      .expect(404,done);
    });

  });
  context('Get /browse/authors',function() {
    it('should not have a collections route defined', function(done){
      request(periodicjs.expressapp)
      .get('/browse/authors')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/browse\/authors/)
      .expect(404,done);
    });

  });
  context('Get /browse/contenttypes',function() {
    it('should not have a collections route defined', function(done){
      request(periodicjs.expressapp)
      .get('/browse/contenttypes')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/browse\/contenttypes/)
      .expect(404,done);
    });

  });
  context('Get /browse/categories',function() {
    it('should not have a collections route defined', function(done){
      request(periodicjs.expressapp)
      .get('/browse/categories')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/browse\/categories/)
      .expect(404,done);
    });

  });
  context('Get /browse/tags',function() {
    it('should not have a collections route defined', function(done){
      request(periodicjs.expressapp)
      .get('/browse/tags')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/browse\/tags/)
      .expect(404,done);
    });

  });
  context('Get /p-admin',function() {
    it('should not have a collections route defined', function(done){
      request(periodicjs.expressapp)
      .get('/p-admin')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/Sorry page not found!/)
      .expect(/page: \/p-admin/)
      .expect(404,done);
    });

  });
});

