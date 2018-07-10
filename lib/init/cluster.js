'use strict';
const https = require('https');
const path = require('path');
const fs = require('fs-extra');
const clusterModule = require('cluster');
const os = require('os');

function onlineEventHandler(worker) {
  this.logger.info(`Master Process (${process.pid}) Worker ${worker.process.pid} is online`);
  this.config.masterProcessId = process.pid;
}

function exitEventHandler(cluster, worker, code, signal) {
  this.logger.info(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
  this.logger.info('Starting a new worker');
  cluster.fork();
}

// Receive messages from this worker and handle them in the master process.
function workerProcessMessageHandler(msg) {
  // console.log('Master ' + process.pid + ' received message from worker.', msg);
  const cluster = this.cluster || clusterModule;
  for (const id in cluster.workers) {
    if (cluster.workers[ id ].process.pid === msg.pid) {
      cluster.workers[ id ].send({
        cmd: 'configureMasterProcessId',
        masterProcessId: process.pid,
        id,
      });
    }
  }
}

function forkProcess() {
  const nodeProcess = this.nodeProcess || process;
  const cluster = this.cluster || clusterModule;
  this.cluster = cluster;
  this.workers = [];
  const onlineEventHandlerFunc = onlineEventHandler.bind(this);
  const exitEventHandlerFunc = exitEventHandler.bind(this, cluster);
  return new Promise((resolve, reject) => {
    try {
      if (this.settings.application.cluster_process) {
        if (cluster.isMaster) {
          this.config.process.isMaster = true;
          this.numWorkers = this.settings.application.number_of_clusters || os.cpus().length;
          this.logger.info(`Master cluster setting up ${this.numWorkers} workers...`);
          const spawn = i => {
            this.workers[i] = cluster.fork();
          };
          for (let i = 0; i < this.numWorkers; i++) {
            spawn(i);
          }
          for (const id in cluster.workers) {
            // Receive messages from this worker and handle them in the master process.
            cluster.workers[ id ].on('message', workerProcessMessageHandler.bind(this));
          }
        
          cluster.on('online', onlineEventHandlerFunc);
          cluster.on('exit', exitEventHandlerFunc);
          // this.config.process.isClustered = true;
          resolve(true);
        } else {
          this.config.process.pid = nodeProcess.pid;
          this.config.process.isClustered = true;
          this.config.process.isMaster = false;
          this.status.emit('cluster-process-waiting-on-master', true);
          nodeProcess.send({
            cmd: 'requestMasterProcessId',
            pid: process.pid,
          });
          nodeProcess.on('message', (msg, connection) => {
            // console.log(`WORKER (${process.pid}): Got message`, msg);
            if (this.settings.application.cluster_process) {
              if (msg !== 'sticky-session:connection') return;
            } else {
              this.status.emit('cluster-process-master-message', msg);
              this.status.emit('clustered-process-master-process-id', msg.masterProcessId);
              this.config.process.masterProcessId = msg.masterProcessId;
            }
          });

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
  onlineEventHandler,
  exitEventHandler,
};