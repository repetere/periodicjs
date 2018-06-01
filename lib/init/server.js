'use strict';
const https = require('https');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

function startHTTPserver() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.application.server.http && this.settings.application.server.http.port) {
        const httpServer = this.app.listen(this.settings.application.server.http.port, e => {
          if (e) {
            reject(e);
          } else {
            this.logger.verbose(`http server listening on port ${this.settings.application.server.http.port}`);
          }
          resolve(true);
        });
        this.servers.set('http', httpServer);
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
        const httpsServer = https.createServer(httpsServerOptions, this.app).listen(this.settings.application.server.https.port, e => {
          if (e) {
            reject(e);
          } else {
            this.logger.verbose(`https server listening on port ${this.settings.application.server.https.port}`);
          }
          resolve(true);
        });
        this.servers.set('https', httpsServer);
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
      if (this.settings.application.server.socketio) {
        const socker_server_config = this.settings.application.server.socketio;
        const socketioServer = require('socket.io')(socker_server_config.port);
        // console.log('initial',{ socketioServer });
        switch (socker_server_config) {
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
          socketioServer.volatile.sockets.emit('server-start', {
            hostname: os.hostname,
            pid: this.config.process.pid,
            isClustered:this.config.process.isClustered,
            isMaster:this.config.process.isMaster,
          });
          socketioServer.volatile.emit('server-start-broadcast', {
            hostname: os.hostname,
            pid: this.config.process.pid,
            isClustered:this.config.process.isClustered,
            isMaster:this.config.process.isMaster,
          });
          socketioServer.on('server-start', (msg)=> {
            logger.verbose(`${os.hostname} socket server awk[server-start-broadcas]`,msg);
          });
          socketioServer.on('server-start-broadcast', (msg)=> {
            logger.verbose(`${os.hostname} socket server awk[server-start-broadcas]`,msg);
          });
        }
        this.servers.set('socketio', socketioServer);
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
  return Promise.all([
    startHTTPserver.call(this),
    startHTTPSserver.call(this),
    startSocketIOserver.call(this),
    emitConfigurationComplete.call(this),
  ]);
}

module.exports = {
  startHTTPserver,
  startHTTPSserver,
  startSocketIOserver,
  emitConfigurationComplete,
  initializeServers,
};