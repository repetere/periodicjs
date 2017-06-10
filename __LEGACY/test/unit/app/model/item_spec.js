'use strict';
/*jshint expr: true*/
const bcrypt = require('bcrypt');
const Promisie = require('promisie');
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const path = require('path');
const periodic = require(path.resolve(__dirname, '../../../../app/lib/periodic.js'));
const periodicLib = periodic({
  waitformongo: true,
  skip_install_check: true,
  env: 'test',
  debug: false,
  port: 8011
});
const mongo_start = require('../../../utility/mongo_start.js');

let periodicjs;
let testDocuments = {};
let mongoose;
let Item;
let mongoConnected = false;
chai.use(require('sinon-chai'));
describe('A module that represents a item model',function (){
  this.timeout(10000);
  before('item_spec initialize periodic',function (done){
    mongo_start({
			periodicLib,
			periodicjs,
			mongoose,
			mongoConnected,
		})
		.then(resolvedApp => {
			periodicjs = resolvedApp.periodicjs;
			mongoose = resolvedApp.mongoose;
			mongoConnected = resolvedApp.mongoConnected;
      Item = mongoose.model('Item');
			done();
		})
		.catch(e => done);
  });
  describe('The Item Model',function (){
    before('Delete test items',function (done){
      let items_to_delete = [{name: 'test_item_0293401943208942304'}];
      mongoConnected = true;

      Promise.all(items_to_delete.map((testitem) =>{
        return Promisie.promisify(Item.remove,Item)(testitem);
      }))
        .then((/*remove_results*/) => done())
        .catch((e) =>{
          console.log('remove_results e',e);
          expect(e).to.not.be.ok;
          done(e);
        });
    });
    it('should return a function',function (done){
      // console.log(periodicjs.mongoose.model('Item'))
      expect(Item).to.be.a('function');
      done();
    });
    it('should validate a valid item',function (done){
      let inValidItemTest = {
        name: '',
      };
      let valideItem = {
        name: 'test_item_0293401943208942304',
      };
      testDocuments.Items = testDocuments.Items || [];
      testDocuments.Items.push(valideItem);
      let testItem = new Item(inValidItemTest);
      let testItem2 = new Item(valideItem);

      Promisie.promisify(testItem.save,testItem)()
        .then(() =>{
        },(err) =>{
          // console.log('testItem err',err);
          expect(err).to.be.an('error');
          return Promisie.promisify(testItem2.save,testItem2)();
        })
        .then((newItem2) =>{
          // console.log('testItem2 err',newItem2);
          expect(newItem2).to.be.a('object');
          done();
        })
        .catch((e) =>{
          console.log('testing valid user errors',e);
          done(e);
        });
    });
    after('Delete test items',function (done){
      Promise.all(testDocuments.Items.map((testitem) =>{
        return Promisie.promisify(Item.remove,Item)(testitem);
      }))
        .then((/*remove_results*/) => done())
        .catch((e) =>{
          console.log('remove_results e',e);
          expect(e).to.not.be.ok;
          done(e);
        });
    });
  });

});
