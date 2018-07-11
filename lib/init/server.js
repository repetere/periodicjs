'use strict';
const https = require('https');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const socketConnections = new Map();

function startHTTPserver() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.application.server.http && this.settings.application.server.http.port) {
        if (Array.isArray(this.settings.application.server.http.port) == false) {
          this.settings.application.server.http.port = [
            this.settings.application.server.http.port,
          ];
        }
        this.settings.application.server.http.port.forEach(httpPort => {
          const httpServer = this.app.listen(httpPort, e => {
            if (e) {
              reject(e);
            } else {
              this.logger.verbose(`http server listening on port ${httpPort}`);
            }
            resolve(true);
          });
          this.servers.set('http', httpServer);
        });
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function startHTTPSserver() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.application.server.https && this.settings.application.server.https.port) {
        const httpsServerOptions = {};
        if (this.settings.application.server.https.ssl.p12 || this.settings.application.server.https.ssl.pfx) {
          httpsServerOptions.pfx = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.p12 || this.settings.application.server.https.ssl.pfx));
        }
        // if (this.settings.application.server.https.ssl.pfx){
        //   httpsServerOptions.pfx = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.pfx));
        // }
        if (this.settings.application.server.https.ssl.private_key || this.settings.application.server.https.ssl.certificate) {
          httpsServerOptions.key = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.private_key));
          httpsServerOptions.cert = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.certificate));
        }
        // if (this.settings.application.server.https.ssl.certificate){
        // }
        if (Array.isArray(this.settings.application.server.https.port) === false) {
          this.settings.application.server.https.port = [
            this.settings.application.server.https.port,
          ];
        }
        this.settings.application.server.https.port.forEach(httpsPort => {
          const httpsServer = https.createServer(httpsServerOptions, this.app).listen(httpsPort, e => {
            if (e) {
              reject(e);
            } else {
              this.logger.verbose(`https server listening on port ${httpsPort}`);
            }
            resolve(true);
          });
          this.servers.set('https', httpsServer);
        });
      } else {
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function startSocketIOserver() {
  return new Promise((resolve, reject) => {
    try {
      const socker_server_config = this.settings.application.server.socketio;
      if (socker_server_config && socker_server_config.type) {
        if (socker_server_config.skip_tls_check) {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        const socketioServer = require('socket.io')(socker_server_config.options);
        // console.log('initial',{ socketioServer });
        switch (socker_server_config.type) {
        case 'redis':
          var redisIoAdapater = require('socket.io-redis');
          var redis_url = require('redis-url');
          var redis_conf = socker_server_config.redis_config;
          var redis_config_obj = ((!redis_conf.port || !redis_conf.host))
            ? Object.assign({}, redis_conf, redis_url.parse(redis_conf.url))
            : redis_conf;
            
          if (redis_config_obj.pass || redis_config_obj.password) {
            if (redis_config_obj.password) {
              redis_config_obj.pass = redis_config_obj.password;
            }
            const redis = require('redis').createClient;
            const pub = redis(redis_config_obj.port, redis_config_obj.host, { auth_pass: redis_config_obj.pass, });
            const sub = redis(redis_config_obj.port, redis_config_obj.host, { return_buffers: true, auth_pass: redis_config_obj.pass, });
            socketioServer.adapter(redisIoAdapater({ pubClient: pub, subClient: sub, }));
          } else {
            socketioServer.adapter(redisIoAdapater({ host: redis_config_obj.host, port: redis_config_obj.port, }));
          }
          break;  
        case 'mongo':
          var mongoIoAdapter = require('@yawetse/socket.io-adapter-mongo');
          var additionalIOConfigs = { return_buffers: true, detect_buffers: true, };
          socketioServer.adapter(mongoIoAdapter(socker_server_config.mongo_config.url, additionalIOConfigs));
          break;
        }
        if (this.servers.get('http')) {
          socketioServer.attach(this.servers.get('http'), {
            logger: this.logger,
          });
          this.logger.verbose(`socket server listening on port ${this.settings.application.server.https.port}`);
        }
        if (this.servers.get('https')) {
          socketioServer.attach(this.servers.get('https'), {
            logger: this.logger,
          });
          this.logger.verbose(`socket server listening on port ${this.settings.application.server.http.port}`);
        }
        if (socketioServer && socketioServer.sockets) {
          socketioServer.on('connection', socket => {
            if (this.config.debug) {
              this.logger.debug('new socket connection', socket.connected);
              socket.emit('debug', {
                hostname: os.hostname,
                pid: this.config.process.pid,
                isClustered:this.config.process.isClustered,
                isMaster:this.config.process.isMaster,
              });
              socketioServer.emit('message', {
                msg: `${socket.id} connected`,
              });
            }
            socketConnections.set(socket.id, socket);
            this.logger.debug('connections', Array.from(socketConnections.keys()).slice(0, socketConnections.size < 100 ? socketConnections.size : 100));
            socket.on('disconnect', () => {
              socketConnections.delete(socket.id);
            });
          });
          socketioServer.on('error', this.logger.error);
          socketioServer.on('disconnect', socket => {
            if (this.config.debug) {
              this.logger.debug('disconnecting socket', socket.id);
            }
            socketConnections.delete(socket.id);
          });
        }
        this.servers.set('socket.io', {
          server: socketioServer,
          sockets: socketConnections,
        });
        resolve(true);
      } else {        
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

function emitConfigurationComplete() {
  return new Promise((resolve, reject) => {
    try {
      this.status.emit('configuration-complete', true);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

function initializeServers() {
  if (this.cluster && !this.cluster.isMaster) {
    return Promise.resolve(true);
  } else {
    return Promise.all([
      startHTTPserver.call(this),
      startHTTPSserver.call(this),
      startSocketIOserver.call(this),
      emitConfigurationComplete.call(this),
    ]);
  }
}

module.exports = {
  startHTTPserver,
  startHTTPSserver,
  startSocketIOserver,
  emitConfigurationComplete,
  initializeServers,
};