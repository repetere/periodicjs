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
const setup = require('../../../lib/extension/setup');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
const testPathDir = path.resolve(__dirname, '../../mock/spec/periodic');
const setupDir = path.join(testPathDir, 'ExtSetup');
const initExtensionFiles = path.join(setupDir, '/my-example-app/node_modules/sample-extension/config/databases/standard/models');
const exampleJSFile = path.join(initExtensionFiles, '/sample_model.js');

describe('Periodic Extension setup', function() {
    this.timeout(10000);
    before('initialize test periodic dir', (done) => {
        Promise.all([
                fs.ensureDir(initExtensionFiles),
            ])
            .then((result) => {
                console.log({ result });
                return Promise.all([
                    fs.outputFile(exampleJSFile, 'var test= "working"', function(jsFileCreated) {
                        console.log({ jsFileCreated });
                        return;
                    }),
                ])
            })
            .then((created) => {
                console.log({ created });
                done();
            }).catch(done);
    });
    describe('getModelFilesMap', () => {
        it('should return fullpath of the model file', () => {
            expect(setup.getModelFilesMap('/dirname', '/path/to/file')).to.eql('/dirname/path/to/file/___FULLPATH___');
        });
    });
    describe('loadExtensionFiles', () => {
        it('should load extension files', (done) => {
            // fs.readdir = sinon.spy();
            const mockThis = {
                resources: { 
                    standard_models: [],
                },
                config: {
                    app_root: '/my-example-app',
                },
            };
            const mockOptions = {
                extension: {
                    name: 'sample-extension',
                },
                container: {},
            }      
            setup.loadExtensionFiles.call(mockThis, mockOptions)
                .then(result => {

                    // expect(fs.readdir.called).to.be.true;
                    console.log("DIDNT ERROR");
                    done();
                })
                .catch(e => {
                    console.log('*****THIS IS ERROR', e);
                    done();
                });
        });
    });
    describe('loadExtensionSettings', () => {

    });
    describe('getExtensionFromMap', () => {

    });
    describe('assignExtensionResources', () => {

    });
    describe('setupExtensions', () => {

    });
    describe('setupContainer', () => {

    });
    after('remove test periodic dir', (done) => {
        Promise.all([
                fs.remove(setupDir),
            ])
            .then(() => {
                done();
            }).catch(done);
    });
});