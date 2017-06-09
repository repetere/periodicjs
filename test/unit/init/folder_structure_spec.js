'use strict';
/*jshint expr: true*/
const path = require('path');
const events = require('events');
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs-extra');
const expect = require('chai').expect;
const periodic = require('../../../index');
const periodicClass = require('../../../lib/periodicClass');
const folderStructure = require('../../../lib/init/folderStructure');
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const initTestPathDir = path.join(testPathDir, 'folderStructureTest');
const initStructTestPathDir = path.join(testPathDir, 'folderStructureTest2');
const __STRUCTURE_DIR = path.resolve(__dirname, '../../../__STRUCTURE');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Periodic Init Folder Structure', function() {
  this.timeout(10000);
  before('initialize folder test periodic dir', (done) => {
    Promise.all([
        fs.ensureDir(initTestPathDir),
        fs.ensureDir(initStructTestPathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });

  describe('setUpFolderStructure', () => {
    it('should copy files to app_root', (done) => {
      const testPeriodic = {
        config: {
          app_root: initTestPathDir,
        },
      };
      folderStructure.call(testPeriodic)
        .then(copiedDir => {
          return Promise.all([
            fs.readdir(initTestPathDir),
            fs.readdir(__STRUCTURE_DIR),
          ]);
        })
        .then(results => {
          // console.log({ results });
          expect(results[0]).to.eql(results[1]);
          done();
        })
        .catch(done);
    });
    it('should not overwrite existing files', (done) => {
      const testPeriodic = {
        config: {
          app_root: initTestPathDir,
        },
      };
      const customConfig = {
        "configuration": {
          "type": "db",
          "db": "lowkie",
          "options": {
            "dbpath": "content/config/settings/custom.json"
          }
        },
        "settings": {
          "name": "My Existing APP"
        }
      };
      const configPath = path.join(initTestPathDir, 'content/config/config.json');
      fs.outputJson(path.join(initTestPathDir, 'content/config/config.json'), customConfig)
        .then(() => {
          return folderStructure.call(testPeriodic)
        })
        .then(() => {
          return fs.readJson(configPath)
        })
        .then(updatedJsonAfterCopy => {
          expect(updatedJsonAfterCopy).to.eql(customConfig);
          done();
        })
        .catch(done);

    });
    it('should return a promise', () => {
      const testPeriodic = {
        config: {
          app_root: initStructTestPathDir,
        },
      };
      const fsPromise = folderStructure.call(testPeriodic);
      expect(fsPromise).to.be.a('promise');
    });
  });

  after('remove folder test periodic dir', (done) => {
    Promise.all([
        fs.remove(initTestPathDir),
        fs.remove(initStructTestPathDir),
      ])
      .then(() => {
        done();
      }).catch(done);
  });
});