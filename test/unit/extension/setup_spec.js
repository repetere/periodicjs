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
const initSettingsContainerFiles = path.join(setupDir, '/my-example-app/content/container/sample-container/config');
const initSettingsExtensionFiles = path.join(setupDir, '/my-example-app/node_modules/sample-extension');
const exampleJSFile = path.join(initExtensionFiles, '/sample_model.js');
const settingsFile = path.join(initSettingsContainerFiles, '/settings.js');
const settingsExtensionFile = path.join(initSettingsExtensionFiles, '/config/settings.js');
const settingsRuntimeFile = path.resolve(setupDir, '/my-example-app/content/container/sample-container/test_runtime.json');
const settingsRuntimeExtensionFile = path.resolve(setupDir, '/my-example-app/content/extension/sample-extension/test_runtime.json');


describe('Periodic Extension setup', function() {
    this.timeout(10000);
    before('initialize test periodic dir', (done) => {
        Promise.all([
                fs.ensureDir(initExtensionFiles),
                fs.ensureDir(initSettingsContainerFiles),
                fs.ensureDir(initSettingsExtensionFiles),
            ])
            .then((result) => {
                return Promise.all([
                    fs.outputFile(exampleJSFile, '', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(settingsFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(settingsRuntimeFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(settingsExtensionFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(settingsRuntimeExtensionFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    })
                ])
            })
            .then((created) => {
                done();
            }).catch(done);
    });

    describe('getModelFilesMap', () => {
        it('should return fullpath of the model file', () => {
            expect(setup.getModelFilesMap('/dirname', '/path/to/file')).to.eql('/dirname/path/to/file/___FULLPATH___');
        });
    });

    describe('loadExtensionFiles -- has models', () => {
        it('should load extension files', (done) => {
            const mockThis = {
                resources: { 
                    standard_models: [],
                },
                config: {
                    app_root: path.join(setupDir, '/my-example-app'),
                },
            };
            const mockOptions = {
                extension: {
                    name: 'sample-extension',
                },
                container: {},
            };      
            setup.loadExtensionFiles.call(mockThis, mockOptions)
                .then((hasLoadedExtensions) => {
                    expect(hasLoadedExtensions).to.be.true;
                    done();
                })
                .catch(e => {
                    done();
                });
        });
    });

    describe('loadExtensionFiles -- doesnt have models', () => {
        it('should return a message if files dont exist', (done) => {
            const mockThis = {
                resources: { 
                    standard_models: [],
                },
                config: {
                    app_root: path.join(setupDir, '/app-does-not-exist'),
                },
                configuration: {
                    load: (options) => {
                        return new Promise((resolve, reject) => {
                            done();
                            resolve(true);
                        })
                    }
                }
            };
            const mockOptions = {
                extension: {
                    name: 'sample-extension',
                },
                container: {},
            }      
            setup.loadExtensionFiles.call(mockThis, mockOptions)
                .then((loadedExtensions) => {
                    expect(loadedExtensions).to.equal('does not have standard models')
                    done();
                })
                .catch(e => {
                    done();
                });
        });
    });
    describe('loadExtensionSettings', () => {
        it('should set default settings for container', (done) => {
            const mockThis = {
                settings: {
                    container: {
                        'sample-container': {
                            databases: {
                                'sample_db': {}
                            }
                        }
                    },
                },
                resources: {
                    standard_models: [],
                    databases: {
                        container: {}
                    }
                },
                config: {
                    app_root: path.join(setupDir, '/my-example-app'),
                    process: {
                        runtime: 'test_runtime',
                    }
                },
                configuration: {
                    load: (options) => {
                        return new Promise((resolve, reject) => {
                            done();
                            resolve({ db_based_configs: true });
                        })
                    }
                }
            }
            const mockOptions = {
                container: {
                    name: 'sample-container',
                    type: 'local',
                },
            };
            setup.loadExtensionSettings.call(mockThis, mockOptions)
                .then(resolvedSettings => {
                    expect(resolvedSettings).to.be.true;
                })
                .catch(done);
        });

        it('should set default settings for extensions', (done) => {
            const mockThis = {
                settings: {
                    extensions: {},
                },
                resources: {
                    standard_models: [],
                    databases: {
                        extensions: {}
                    }
                },
                config: {
                    app_root: path.join(setupDir, '/my-example-app'),
                    process: {
                        runtime: 'test_runtime',
                    }
                },
                configuration: {
                    load: (options) => {
                        return new Promise((resolve, reject) => {
                            done();
                            resolve({ db_based_configs: true });
                        })
                    }
                }
            }
            const mockOptions = {
                extension: {
                    name: initSettingsExtensionFiles,
                    type: 'local',
                },
            };
            setup.loadExtensionSettings.call(mockThis, mockOptions)
                .then(resolvedSettings => {
                    expect(resolvedSettings).to.be.true;
                })
                .catch(done);
        });

        it('should fail when default settings is missing', (done) => {
            const warnSpy = sinon.spy();
            const mockThis = {
                settings: {},
                resources: {},
                config: {
                    app_root: path.join(setupDir, '/my-example-app'),
                    debug: true,
                },
                configuration: {
                    process: {
                        runtime: 'test_runtime',
                    },
                },
                logger: {
                    warn: warnSpy,
                }
            }
            const mockOptions = {
                container: {
                    name: 'sample-container'
                }
            };
            try {
                setup.loadExtensionSettings.call(mockThis, mockOptions)
                    .then(resolvedSettings => {
                        return;
                    })
            } catch (e) {
                expect(warnSpy.called).to.be.true;
                done();
            }
        });
    });

    describe('getExtensionFromMap', () => {
        it('should return objectified extension', () => {
            expect(setup.getExtensionFromMap('sample-extension')).to.deep.eql({ extension: 'sample-extension' });
        });
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