'use strict';
/*jshint expr: true*/

const path = require('path');
const Promisie = require('promisie');
const periodic = require(path.resolve(__dirname,'../../../../app/lib/periodic.js'));
const periodicLib = periodic({waitformongo: true,skip_install_check: true,env: 'test'});
const expect = require('chai').expect;
const context = describe;
const supertest = require('supertest');
const http = require('http');
const create_server = require('../../../utility/create_server.js');

let periodicjs;
let mongoose;
let periodicExpressApp;
let request;
let number_of_extensions;
let number_of_enabled_extensions = 0;
let install_extension_enabled = false;
let has_custom_theme = false;
let default_routes_extension_enabled = false;
let admin_extension_enabled = false;
let mongoConnected = false;

// function getCookie(res) {		 +describe('the default routes when no modules are installed', function () {
//   return res.headers['set-cookie'][0].split(';')[0];		 +    this.timeout(10000);
// }

describe('the default routes when no modules are installed',function (){
  this.timeout(10000);
  before('connect to mongo', function (done) {
    create_server({
      periodicExpressApp,
      periodicLib,
      periodicjs,
      mongoose,
      mongoConnected,
    })
      .then(resolvedApp => {
      periodicExpressApp = resolvedApp.periodicExpressApp;
      // periodicLib = resolvedApp.periodicLib;
      periodicjs = resolvedApp.periodicjs;
      mongoose = resolvedApp.mongoose;
      mongoConnected = resolvedApp.mongoConnected;
      request = supertest('http://localhost:' + periodicjs.port);
      number_of_extensions = periodicjs.periodic.settings.extconf.extensions.length;
      for (var x in periodicjs.periodic.settings.extconf.extensions) {
        if(periodicjs.periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.default_routes' && periodicjs.periodic.settings.extconf.extensions[x].enabled === true){
          default_routes_extension_enabled = true;
        }
        if(periodicjs.periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.asyncadmin' && periodicjs.periodic.settings.extconf.extensions[x].enabled === true){
          admin_extension_enabled = true;
        }
        if(periodicjs.periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.install' && periodicjs.periodic.settings.extconf.extensions[x].enabled === true){
          install_extension_enabled = true;
        }
        if(periodicjs.periodic.settings.extconf.extensions[x].enabled === true){
          number_of_enabled_extensions++;

        }
      }
      if(periodicjs.periodic.settings.theme){
        has_custom_theme = true;
      }
      console.log('number_of_extensions',number_of_extensions);
      console.log('number_of_enabled_extensions',number_of_enabled_extensions);
      console.log('default_routes_extension_enabled',default_routes_extension_enabled);
      console.log('admin_extension_enabled',admin_extension_enabled);
      done();
    })
    .catch(e => done);
  });
  context('GET /',function (){
    it('should show the views/home page',function (done){
      if(number_of_enabled_extensions === 0 && !has_custom_theme){
        request
          .get('/')
          .expect('Content-Type','text/html; charset=utf-8')
          .expect(/Periodic is an enterprise information and content management system, designed to quickly implement your own information architecture./)
          .expect(200,done);
      }
      else {
        done();
      }
    });
    it('should respond with 404 it given an unknown route',function (done){
      if(install_extension_enabled === false && !has_custom_theme){
        request
          .get('/random-page-not-found-9809j0vnq8hv0h708jv0advnotfound' + new Date())
          .expect('Content-Type','text/html; charset=utf-8')
          // .expect(/Sorry page not found!/)
          .expect(/page: \/random-page-not-found-9809j0vnq8hv0h708jv0advnotfound/)
          .expect(404,done);
      }
      else {
        done();
      }
    });
    it('should respond with json when requesting json',function (done){
      if(number_of_enabled_extensions === 0 && !has_custom_theme){
        request
          .get('/')
          .set('Accept','application/json')
          .expect('Content-Type',/json/)
          .expect(200,done);
      }
      else {
        done();
      }
    });
  });
  describe('Default Routes are configured correctly',function (){
    context('Get /articles',function (){
      it('should have the route article installed',function (done){
        if(default_routes_extension_enabled){
          request
            .get('/articles')
            .expect('Content-Type','text/html; charset=utf-8')
            .expect(200,done);
        }
        else {
          done();
        }
      });
    });
  });
});
