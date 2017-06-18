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
const initEmptyContainerDir = path.join(setupDir, '/my-example-app/content/container/empty-container');
const initSettingsExtensionFiles = path.join(setupDir, '/my-example-app/node_modules/sample-extension');
const initContainerExtensionRouterDir = path.join(setupDir, '/my-example-app/content/container/sample-container/routers');
const initContainerExtensionControllerDir = path.join(setupDir, '/my-example-app/content/container/sample-container/controllers');
const initContainerExtensionUtilsDir = path.join(setupDir, '/my-example-app/content/container/sample-container/utilities');
const initContainerExtensionCommandsDir = path.join(setupDir, '/my-example-app/content/container/sample-container/commands');
const initContainerExtensionTransformsDir = path.join(setupDir, '/my-example-app/content/container/sample-container/transforms');
const exampleJSFile = path.join(initExtensionFiles, '/sample_model.js');
const settingsFile = path.join(initSettingsContainerFiles, '/settings.js');
const settingsExtensionFile = path.join(initSettingsExtensionFiles, '/config/settings.js');
const settingsRuntimeFile = path.join(setupDir, '/my-example-app/content/container/sample-container/test_runtime.json');
const settingsRuntimeExtensionFile = path.join(setupDir, '/my-example-app/content/extension/sample-extension/test_runtime.json');
const containerExtensionModuleFile = path.join(setupDir, '/my-example-app/content/container/sample-container/index.js');
const containerEmptyExtensionModuleFile = path.join(setupDir, '/my-example-app/content/container/empty-container/index.js');
const containerExtensionModuleRouterFile = path.join(setupDir, '/my-example-app/content/container/sample-container/routers/index.js');
const containerExtensionModuleControllerFile = path.join(setupDir, '/my-example-app/content/container/sample-container/controllers/index.js');
const containerExtensionModuleUtilFile = path.join(setupDir, '/my-example-app/content/container/sample-container/utilities/index.js');
const containerExtensionModuleCommandsFile = path.join(setupDir, '/my-example-app/content/container/sample-container/commands/index.js');
const containerExtensionModuleTransformsFile = path.join(setupDir, '/my-example-app/content/container/sample-container/transforms/index.js');

describe('Periodic Extension setup', function() {
    this.timeout(10000);
    before('initialize test periodic dir', (done) => {
        Promise.all([
                fs.ensureDir(initExtensionFiles),
                fs.ensureDir(initSettingsContainerFiles),
                fs.ensureDir(initSettingsExtensionFiles),
                fs.ensureDir(initEmptyContainerDir),
                fs.ensureDir(initContainerExtensionRouterDir),
                fs.ensureDir(initContainerExtensionControllerDir),
                fs.ensureDir(initContainerExtensionUtilsDir),
                fs.ensureDir(initContainerExtensionCommandsDir),
                fs.ensureDir(initContainerExtensionTransformsDir),
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
                    }),
                    fs.outputFile(containerExtensionModuleFile, 'module.exports = function(){return true}', function(fileCreated) { return true; }),
                    fs.outputFile(containerExtensionModuleRouterFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerExtensionModuleControllerFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerExtensionModuleUtilFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerExtensionModuleCommandsFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerExtensionModuleTransformsFile, 'module.exports = { pre:{"DELETE":function(req, res, next){next()}}, post: {"GET":function(req, res, next){next()}}}', function(fileCreated) { return true; }),
                    fs.outputFile(containerEmptyExtensionModuleFile, 'module.exports = function(){return true}', function(fileCreated) { return true; }),
                ]);
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
                },
                routers: new Map(),
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
        it('should load resources for container', (done) => {
            const warnSpy = sinon.spy();
            const mockThis = {
                resources: { 
                    standard_models: [],
                    commands: {
                        container: new Map(),
                    }
                },
                logger: {
                    warn: warnSpy,
                },
                transforms: {
                    pre: {

                    },
                    post: {

                    }
                },
                config: {
                    app_root: path.join(setupDir, '/my-example-app'),
                },
                routers: new Map(),
                controller: {
                    container: new Map(),
                },
                locals: {
                    container: new Map(),
                }
            };
            const mockOptions = {
                container: {
                    name: 'sample-container',
                    type: 'local',
                },
            };      
            setup.assignExtensionResources.call(mockThis, mockOptions)
                .then((assignedResources) => {
                    //extensionModule file must export a function
                    expect(assignedResources).to.be.true;
                    expect(warnSpy.called).to.be.false;
                    expect(warnSpy.callCount).to.eql(0);
                    done();
                })
                .catch(e => {
                    console.log({ e });
                    done();
                });
        });


        it('should log warnings if files don\'t exist', (done) => {
            const warnSpy = sinon.spy();
            const mockThis = {
                resources: { 
                    standard_models: [],
                    commands: {
                        container: new Map(),
                    }
                },
                logger: {
                    warn: warnSpy,
                },
                transforms: {
                    pre: {

                    },
                    post: {

                    }
                },
                config: {
                    app_root: path.join(setupDir, '/my-example-app'),
                    debug: true,
                },
                routers: new Map(),
                controller: {
                    container: new Map(),
                },
                locals: {
                    container: new Map(),
                }
            };
            const mockOptions = {
                container: {
                    name: 'empty-container',
                    type: 'local',
                },
            };      
            setup.assignExtensionResources.call(mockThis, mockOptions)
                .then((assignedResources) => {
                    //extensionModule file must export a function
                    console.log({ assignedResources });
                    expect(assignedResources).to.be.true;
                    expect(warnSpy.called).to.be.true;
                    expect(warnSpy.callCount).to.eql(4);
                    done();
                })
                .catch(e => {
                    console.log({ e });
                    done();
                });
        });
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