'use strict';
const https = require('https');
const path = require('path');
const fs = require('fs-extra');

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
        if (this.settings.application.server.https.ssl.p12){
          httpsServerOptions.pfx = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.p12));
        }
        if (this.settings.application.server.https.ssl.pfx){
          httpsServerOptions.pfx = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.pfx));
        }
        if (this.settings.application.server.https.ssl.private_key) {
          httpsServerOptions.key = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.private_key));
        }
        if (this.settings.application.server.https.ssl.certificate){
          httpsServerOptions.cert = fs.readFileSync(path.resolve(this.settings.application.server.https.ssl.certificate));
        }
        const httpsServer = https.createServer(httpsServerOptions,this.app).listen(this.settings.application.server.https.port, e => {
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
        const socketioServer = require('socket.io')();
        this.servers.set('socketio', socketioServer);
      }
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
  ]);
}

module.exports = {
  startHTTPserver,
  startHTTPSserver,
  startSocketIOserver,
  initializeServers,
};