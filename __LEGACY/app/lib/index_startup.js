/*
 * periodicjs
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const extend = require('utils-merge');
// const http = require('http');

/**
 * @description loads the periodic configuration options
 */
exports.loadCustomStartupConfigurations = function(options, callback) {
    try {

        callback(null, options);
    } catch (err) {
        callback(err);
    }
};

exports.useCLI = function(options, callback) {
    try {
        let argv = options.argv;
        if (argv.cli) {
            require('./cli')(argv);
            throw (new Error('Leave Promise Chain: CLI Process'));
        } else {
            options.argv = argv;
            callback(null, options);
        }
    } catch (err) {
        callback(err);
    }
};

exports.setupPeriodicSettings = function(options, callback) {
    /**
     * @description periodic express application
     * @instance express app
     * @global
     * @type {object}
     */
    try {
        let periodicStartupOptions = options.periodicStartupOptions;
        let cluster = options.cluster;
        let libPeriodic = require('./periodic')(periodicStartupOptions);
        libPeriodic.init({}, function(err, periodicInitialized) {
            if (err) {
                callback(err);
            } else {
                let periodicStartupOptions = options.periodicStartupOptions;
                let periodic = periodicInitialized;
                let periodicSettings = periodic.appconfig.settings();
                let server_options = options.server_options;

                if (periodicSettings.cluster_process && cluster.isMaster) {
                    var numWorkers = periodicSettings.cluster_numWorkers || require('os').cpus().length;

                    console.log('Master cluster setting up ' + numWorkers + ' workers...');

                    for (var i = 0; i < numWorkers; i++) {
                        cluster.fork();
                    }

                    cluster.on('online', function(worker) {
                        console.log('Worker ' + worker.process.pid + ' is online');
                    });

                    cluster.on('exit', function(worker, code, signal) {
                        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
                        console.log('Starting a new worker');
                        cluster.fork();
                    });
                    callback(new Error('Leave Promise Chain: Forking Process'));
                } else {
                    global.periodicExpressApp = {};
                    /**
                     * @description the script that starts the periodic express application.
                     * @author Yaw Joseph Etse
                     * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
                     * @license MIT
                     * @requires module:optimist
                     */

                    if (periodicStartupOptions.use_global_socket_io) {
                        global.io = require('socket.io')();
                    }

                    if (periodicSettings.application.https_port) {
                        server_options.key = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_privatekey));
                        server_options.ca = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_certauthority));
                        server_options.cert = fs.readFileSync(path.resolve(periodicSettings.ssl.ssl_certificate));
                    }
                    options.periodic = periodic;
                    options.server_options = server_options;
                    options.periodicSettings = periodicSettings;
                    options.periodicStartupOptions = periodicStartupOptions;
                    options.cluster = cluster;
                    options.libPeriodic = libPeriodic;
                    callback(null, options);
                }



            }
        });
    } catch (err) {
        callback(err);
    }
};

exports.startWebServer = function(options, callback) {
    try {
        let argv = options.argv;
        let periodicSettings = options.periodicSettings;
        let periodic = options.periodic;
        let server_options = options.server_options;
        let mongoConnected = false;
        let mongoose = periodic.mongoose;
        let server_promises = [];
        let start_http_server = function() {
            return new Promise((resolve, reject) => {
                global.periodicExpressApp = periodic.expressapp.listen(periodic.port, function(e) {
                    if (e) {
                        reject(e);
                    } else {
                        console.log('HTTP Server listening on port', periodic.port);
                        resolve(true);
                    }
                });
            });
        };
        let start_https_server = function() {
            return new Promise((resolve, reject) => {
                global.periodicHTTPSExpressApp = https.createServer(server_options, periodic.expressapp).listen(periodicSettings.application.https_port, (e) => {
                    if (e) {
                        reject(e);
                    } else {
                        console.log('HTTPS Server listening on port', periodicSettings.application.https_port);
                        resolve(true);
                    }
                });
            });
        };
        let start_servers = function() {
            Promise.all(server_promises)
                .then(started_servers => {
                    // console.log('started_servers', started_servers);
                    options.server_options = server_options;
                    options.periodic = periodic;
                    options.periodicSettings = periodicSettings;
                    options.argv = argv;
                    callback(null, options);
                })
                .catch(e => callback(e));
        };
        let set_servers_to_start = () => {
            if (periodicSettings.application.https_port) {
                server_promises.push(start_https_server());
            }
            if (periodicSettings.application.port) {
                server_promises.push(start_http_server());
            }
        };
        let start_all_servers = () => {
            if (argv.waitformongo || (periodicSettings && periodicSettings.waitformongo)) {
                if (mongoose.Connection.STATES.connected === mongoose.connection.readyState) {
                    start_servers();
                } else {
                    mongoose.connection.on('connected', () => {
                        start_servers();
                    });
                }
            } else {
                start_servers();
            }
        };

        set_servers_to_start();
        start_all_servers();
    } catch (err) {
        callback(err);
    }
};

exports.useSocketIO = function(options, callback) {
    try {
        let periodicStartupOptions = options.periodicStartupOptions;
        let periodicSettings = options.periodicSettings;
        let periodic = options.periodic;

        if (periodicStartupOptions.use_global_socket_io) {
            if (periodicSettings.socketio_type && periodicSettings.socketio_type === 'redis') {
                var redisIoAdapater = require('socket.io-redis');
                var redis_config_obj = periodicSettings.redis_config;
                if ((!periodicSettings.redis_config.port || !periodicSettings.redis_config.host)) {
                    var redis_url = require('redis-url');
                    redis_config_obj = extend(redis_config_obj, redis_url.parse(periodicSettings.redis_config.url));
                }
                if (redis_config_obj.pass || redis_config_obj.password) {
                    if (redis_config_obj.password) {
                        redis_config_obj.pass = redis_config_obj.password;
                    }
                    var redis = require('redis').createClient;
                    var pub = redis(redis_config_obj.port, redis_config_obj.host, { auth_pass: redis_config_obj.pass });
                    var sub = redis(redis_config_obj.port, redis_config_obj.host, { return_buffers: true, auth_pass: redis_config_obj.pass });
                    global.io.adapter(redisIoAdapater({ pubClient: pub, subClient: sub }));
                } else {
                    global.io.adapter(redisIoAdapater({ host: redis_config_obj.hostname || redis_config_obj.host, port: redis_config_obj.port }));
                }
            } else {
                var mongoIoAdapter = require('@yawetse/socket.io-adapter-mongo'),
                    additionalIOConfigs = { return_buffers: true, detect_buffers: true };
                global.io.adapter(mongoIoAdapter(periodicSettings.dburl, additionalIOConfigs));
            }
            if (periodicSettings.application.port) {
                global.io.attach(global.periodicExpressApp, {
                    logger: periodic.logger
                });
            }
            if (periodicSettings.application.https_port) {
                global.io.attach(global.periodicHTTPSExpressApp, {
                    logger: periodic.logger
                });
            }
        }

        options.periodic = periodic;
        options.periodicSettings = periodicSettings;
        options.periodicStartupOptions = periodicStartupOptions;
        callback(null, options);
    } catch (err) {
        callback(err);
    }
};