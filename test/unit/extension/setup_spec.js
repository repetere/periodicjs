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
const containerConfigDir = path.join(setupDir, '/my-example-app/content/container/sample-container/config');
const emptyContainerDir = path.join(setupDir, '/my-example-app/content/container/empty-container');
const sampleExtensionDir = path.join(setupDir, '/my-example-app/node_modules/sample-extension');
const extensionStandardModelDir = path.join(sampleExtensionDir, '/config/databases/standard/models');
const sampleContainerDir = path.join(setupDir, '/my-example-app/content/container/sample-container');
const sampleContainerRouterDir = path.join(sampleContainerDir, '/routers');
const sampleContainerControllerDir = path.join(sampleContainerDir, '/controllers');
const sampleContainerUtilityDir = path.join(sampleContainerDir, '/utilities');
const sampleContainerCommandDir = path.join(sampleContainerDir, '/commands');
const sampleContainerTransformDir = path.join(sampleContainerDir, '/transforms');
const sampleModelFile = path.join(extensionStandardModelDir, '/sample_model.js');
const containerConfigurationFile = path.join(containerConfigDir, '/settings.js');
const extensionConfigurationFile = path.join(sampleExtensionDir, '/config/settings.js');
const containerRuntimeConfigFile = path.join(sampleContainerDir, '/test_runtime.json');
const extensionRuntimeConfigFile = path.join(setupDir, '/my-example-app/content/extension/sample-extension/test_runtime.json');
const containerExtensionModuleFile = path.join(sampleContainerDir, '/index.js');
const emptyContainerExtensionModuleFile = path.join(emptyContainerDir, '/index.js');
const containerRouterFile = path.join(sampleContainerRouterDir, '/index.js');
const containerControllerFile = path.join(sampleContainerControllerDir, '/index.js');
const containerUtilityFile = path.join(sampleContainerUtilityDir, '/index.js');
const containerCommandFile = path.join(sampleContainerCommandDir, '/index.js');
const containerTransformFile = path.join(sampleContainerTransformDir, '/index.js');

describe('Periodic Extension setup', function() {
    this.timeout(10000);
    before('initialize test periodic dir', (done) => {
        Promise.all([
                fs.ensureDir(sampleExtensionDir),
                fs.ensureDir(extensionStandardModelDir),
                fs.ensureDir(containerConfigDir),
                fs.ensureDir(emptyContainerDir),
                fs.ensureDir(sampleContainerRouterDir),
                fs.ensureDir(sampleContainerControllerDir),
                fs.ensureDir(sampleContainerUtilityDir),
                fs.ensureDir(sampleContainerCommandDir),
                fs.ensureDir(sampleContainerTransformDir),
            ])
            .then((result) => {
                return Promise.all([
                    fs.outputFile(sampleModelFile, '', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(containerConfigurationFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(containerRuntimeConfigFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(extensionConfigurationFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(extensionRuntimeConfigFile, 'module.exports = {test: true}', function(jsFileCreated) {
                        return true;
                    }),
                    fs.outputFile(containerExtensionModuleFile, 'module.exports = function(){return true}', function(fileCreated) { return true; }),
                    fs.outputFile(containerRouterFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerControllerFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerUtilityFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerCommandFile, 'module.exports = {}', function(fileCreated) { return true; }),
                    fs.outputFile(containerTransformFile, 'module.exports = { pre:{"DELETE":function(req, res, next){next()}}, post: {"GET":function(req, res, next){next()}}}', function(fileCreated) { return true; }),
                    fs.outputFile(emptyContainerExtensionModuleFile, 'module.exports = function(){return true}', function(fileCreated) { return true; }),
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
                    name: sampleExtensionDir,
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

    // describe('setupExtensions', () => {
    //     it('should load resources for extension', (done) => {
    //         const warnSpy = sinon.spy();
    //         const mockThis = {
    //             extensions: new Map(),
    //             config: {
    //                 process: {},
    //             },
    //             settings: {
    //                 extensions: {
    //                     'sample-extension': {
    //                         databases: {
    //                             'sample_db': {}
    //                         }
    //                     }
    //                 },
    //             },
    //             resources: {
    //                 standard_models: [],
    //                 databases: {
    //                     extensions: {}
    //                 }
    //             },
    //             configuration: {
    //                 load: (options) => {
    //                     return new Promise((resolve, reject) => {
    //                         done();
    //                         resolve(true);
    //                     })
    //                 }
    //             }
    //         };
    //         mockThis.extensions.set('sample-extension', {
    //             name: 'sample-extension',
    //             resources: { 
    //                 standard_models: [],
    //                 commands: {
    //                     extensions: new Map(),
    //                 }
    //             },
    //             logger: {
    //                 warn: warnSpy,
    //             },
    //             transforms: {
    //                 pre: {

    //                 },
    //                 post: {

    //                 }
    //             },
    //             config: {
    //                 app_root: path.join(setupDir, '/my-example-app'),
    //             },
    //             routers: new Map(),
    //             controller: {
    //                 extensions: new Map(),
    //             },
    //             locals: {
    //                 extensions: new Map(),
    //             }

    //         });     
    //         setup.setupExtensions.call(mockThis)
    //             .then((setupExtensions) => {
    //                 //extensionModule file must export a function
    //                 console.log({ setupExtensions })
    //                 expect(setupExtensions).to.be.true;
    //                 done();
    //             })
    //             .catch(e => {
    //                 console.log({ e });
    //                 done();
    //             });
    //     });
    // });
    describe('setupContainer', () => {
        it('should setup container', (done) => {
            const warnSpy = sinon.spy();
            const mockThis = {
                config: {
                    process: {},
                    app_root: path.join(setupDir, '/my-example-app')
                },
                resources: { 
                    standard_models: [],
                    commands: {
                        container: new Map(),
                    }
                },
                databases: {
                    'sample_db': {}
                },
                settings: {
                    container: {
                        name: 'sample-container',
                        type: 'local',
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
                    },
                },
                resources: {
                    standard_models: [],
                    databases: {
                        container: {}
                    }
                },
                configuration: {
                    load: (options) => {
                        return new Promise((resolve, reject) => {
                            resolve(true);
                        })
                    }
                }
            };    

            setup.setupContainer.call(mockThis)
                .then((setupContainer) => {
                    expect(setupContainer).to.equal('does not have standard models');
                    done();
                })
                .catch(e => {
                    console.log({ e });
                    done();
                });
        });

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