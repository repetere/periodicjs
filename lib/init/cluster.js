'use strict';
const https = require('https');
const path = require('path');
const fs = require('fs-extra');
const cluster = require('cluster');
const os = require('os');

function forkProcess() {
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.application.cluster_process) {
        if (cluster.isMaster) {
          const numWorkers = this.settings.application.number_of_clusters || os.cpus().length;
          this.logger.info(`Master cluster setting up ${numWorkers} workers...`);
          for (let i = 0; i < numWorkers; i++){
            cluster.fork();
          }
          cluster.on('online', (worker) => {
            this.logger.info(`Worker ${worker.process.pid} is online`);
          });

          cluster.on('exit', (worker, code, signal) => {
            this.logger.info(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
            this.logger.info('Starting a new worker');
            cluster.fork();
          });
          this.config.process.isMaster = true;
          reject(new Error('Leave Promise Chain: Forking Process'));
        } else {
          this.config.process.pid = process.pid;
          this.config.process.isClustered = true;
          this.config.process.isMaster = false;
          resolve(true);
        }
      } else {
        this.config.process.isClustered = false;
        resolve(true);
      }
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  forkProcess,
};