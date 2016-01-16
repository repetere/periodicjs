'use strict';
/*jshint expr: true*/

var path       = require('path'),
    // chai       = require('chai'),
    periodic = require(path.resolve(__dirname, '../../../../app/lib/periodic.js')),
    periodicjs = periodic({waitformongo:true,skip_install_check:true,env:'test'}),
    periodicExpressApp,
    expect     = require('chai').expect,
    context    = describe,
    supertest  = require('supertest'),
    request  = supertest('http://localhost:'+periodicjs.port),
    http  = require('http'),
    request    = supertest('http://localhost:'+periodicjs.port),
    number_of_extensions,
    number_of_enabled_extensions = 0,
    install_extension_enabled = false,
    default_routes_extension_enabled = false,
    admin_extension_enabled = false;

// function getCookie(res) {
//   return res.headers['set-cookie'][0].split(';')[0];
// }

describe('the default routes when no modules are installed', function(){
  this.timeout(5000);

  // console.log('new ddr')
  // it('should return an object', function (done) {
  //   expect(periodicjs).to.be.an('object');
  //   done();
  // });
  before('connect to mongo',function (done){
    periodicjs.mongoose.connection.on('connected',function(){
      periodicExpressApp = http.createServer(periodicjs.expressapp).listen(periodicjs.port, function() {
        number_of_extensions = periodicjs.periodic.settings.extconf.extensions.length;
        for (var x in periodicjs.periodic.settings.extconf.extensions) {
          if (periodicjs.periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.default_routes' && periodicjs.periodic.settings.extconf.extensions[x].enabled===true) {
            default_routes_extension_enabled = true;
          }        
          if (periodicjs.periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.asyncadmin' && periodicjs.periodic.settings.extconf.extensions[x].enabled===true) {
            admin_extension_enabled = true;
          }        
          if (periodicjs.periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.install' && periodicjs.periodic.settings.extconf.extensions[x].enabled===true) {
            install_extension_enabled = true;
          }        
          if (periodicjs.periodic.settings.extconf.extensions[x].enabled === true) {
            number_of_enabled_extensions++;
          }

        }
        console.log('number_of_extensions',number_of_extensions);
        console.log('number_of_enabled_extensions',number_of_enabled_extensions);
        console.log('default_routes_extension_enabled',default_routes_extension_enabled);
        console.log('admin_extension_enabled',admin_extension_enabled);
        done();
      });
    });
  });
  context('GET /', function (){
    it('should show the views/home page', function (done){
      if(number_of_enabled_extensions===0){
        request
        .get('/')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(/Periodic is an enterprise information and content management system, designed to quickly implement your own information architecture./)
        .expect(200,done);
      }
      else{
        done();
      }
    });
    it('should respond with 404 it given an unknown route', function (done){
      if(install_extension_enabled===false){
        request
        .get('/random-page-not-found-9809j0vnq8hv0h708jv0advnotfound')
        .expect('Content-Type', 'text/html; charset=utf-8')
        // .expect(/Sorry page not found!/)
        .expect(/page: \/random-page-not-found-9809j0vnq8hv0h708jv0advnotfound/)
        .expect(404,done);
      }
      else{
        done();
      }
    });
    it('should respond with json when requesting json', function (done){
      request
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200,done);
    });
  });
  describe('Default Routes are configured correctly',function(){
    context('Get /articles',function() {
      it('should have the route article installed', function (done){
        if(default_routes_extension_enabled){
          request
          .get('/articles')
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect(200,done);
        }
        else{
          done();
        }
      });
    });
  });
 
  context('Get /p-admin',function() {
    it('should redirect to login', function (done){
      if(admin_extension_enabled){
        request
        .get('/p-admin')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(302,function(err,res){
          expect(err).to.be.a('null');
          expect(res).to.be.an('object');
          done();
        });
      }
      else{
        done();
      }
    });
  });
});
