'use strict';

const path = require('path');
const fs = require('fs-extra');
const flatten = require('flat');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const semver = require('semver');
const expect = require('chai').expect;
const extension_root_dir = path.resolve(__dirname, '../../');
let extension_files=[];
chai.use(require('sinon-chai'));
require('mocha-sinon');
const extensionJSON = require(path.join(extension_root_dir, 'periodicjs.ext.json'));

describe('Valid Periodic extension', function () {
  this.timeout(10000);
  describe('complete extension folder structure', function () {
    it('should have all of the required extension components', (done) => {
      const standardExtensionStructure = [
        'commands',
        'config',
        'controllers',
        'doc',
        'resources',
        'routers',
        'test',
        'transforms',
        'utilities',
        'views',
        'index.js',
        'package.json',
        'periodicjs.ext.json',
      ];
      let requiredStructure = standardExtensionStructure.length;
      fs.readdir(extension_root_dir)
        .then(files => {
          extension_files = files;
          files.forEach(file => {
            if (standardExtensionStructure.indexOf(file.toString()) > -1) {
              requiredStructure--;
            }
          });
          expect(files.length).to.be.greaterThan(standardExtensionStructure.length - 1);
          expect(requiredStructure).to.eql(0);
          done();
        })
        .catch(done);
    });
    it('should export asynchronous tasks', () => {
      if (extension_files.indexOf('commands') > -1) {
        const EXTENSION_commands = require(path.join(extension_root_dir, 'commands/index'));
        Object.keys(EXTENSION_commands).forEach(command => {
          expect(EXTENSION_commands[ command ]).to.be.a('function');
        });
      } else {
        console.log('Extension has no commands');
      }
    });
    it('should export default config, with settings and databases', () => {
      const EXTENSION_config = require(path.join(extension_root_dir, 'config/settings'));
      expect(EXTENSION_config.settings).to.be.an('object');
      expect(EXTENSION_config.databases).to.be.an('object');
    });
    it('should export valid utilities', () => {
      const EXTENSION_utilities = require(path.join(extension_root_dir, 'utilities/index'));
      expect(EXTENSION_utilities).to.be.an('object');
    });
    it('should export a valid express router', () => {
      if(extension_files.indexOf('routers') >-1 ){
        const EXTENSION_routers = require(path.join(extension_root_dir,   'routers/index'));
        expect(EXTENSION_routers).to.be.a('function');
        expect(EXTENSION_routers).to.have.a.property('stack');
        expect(EXTENSION_routers).to.have.a.property('params');
      } else {
        console.log('Extension has no routes');
      }
    });
    it('should export valid functions from transforms', () => {
      if (extension_files.indexOf('transforms') > -1) {
        const EXTENSION_transforms = require(path.join(extension_root_dir, 'transforms/index'));
        const flattened_transforms = flatten(EXTENSION_transforms);
        Object.keys(flattened_transforms).forEach(transform => {
          if (Object.keys(flattened_transforms[ transform ]).length) {
            expect(flattened_transforms[ transform ]).to.be.a('function');
          }
        });
      } else {
        console.log('Extension has no transforms');
      }
    });
    it('should export a valid node module',()=>{
      const EXTENSION_module = require(path.join(extension_root_dir, 'index'));
      expect(EXTENSION_module).to.be.a('function');
    });
  });
  describe('periodicjs.ext.json', function () { 
    it('should declare periodic compatibility', () => {
      expect(semver.valid(extensionJSON.periodic_compatibility)).to.be.ok;
      expect(extensionJSON.periodic_compatibility).to.be.a('string');
    });
    it('should have a valid periodic_type', () => {
      // console.log('Extension periodicjs.ext.json periodic_type classification (0-core, 1-communication, 2-auth, 3-uac, 4-api, 5-admin,6-data,7-ui)');
      expect(extensionJSON.periodic_type).to.be.oneOf([ 0, 1, 2, 3, 4, 5, 6, 7 ]);
    });
    it('should have a valid periodic_priority', () => {
      expect(extensionJSON.periodic_priority).to.be.a('number');
    });
    it('should define a cross extension configurations', () => {
      expect(extensionJSON.periodic_config).to.be.a('object');
    });
  });
});