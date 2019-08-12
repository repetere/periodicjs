'use strict';
const path = require('path');
const fs = require('fs-extra');
const __STRUCTURE_DIR = path.resolve(__dirname, '../../__STRUCTURE');
const clusterModule = require('cluster');

/**
 * this will setup a periodic application folder structure if one doesnt exist, it will not overwrite existing configs
 * 
 * @returns Promise setUpFolderStructure will copy folders from the application __STRUCTURE directory to initialize the application
 */
function setUpFolderStructure() {
  const cluster = this.cluster || clusterModule;
  return new Promise((resolve, reject) => {
    try {
      if (process.env.npm_config_skip_cli_reconfig || this.config.skip_reconfig) {
        return resolve(true);
      } else if (cluster.isMaster===false) {
        return resolve(true);
      } else {
        fs.copy(__STRUCTURE_DIR, this.config.app_root, {
          overwrite: false,
          clobber: false,
          preserveTimestamps: true,
        })
          .then(() => { //check to make sure there arent two config files (both a json and a js file, if there are both, use the json file)
            return Promise.all([
              fs.copy(path.join(__STRUCTURE_DIR, 'public'), path.join(this.config.app_root, 'public'), {
                overwrite: true,
                clobber: true,
                preserveTimestamps: true,
                filter: (src, dest) => {
                  return src.indexOf('favicon') === -1;
                },
              }),
              fs.copy(path.join(__STRUCTURE_DIR, 'app'), path.join(this.config.app_root, 'app'), {
                overwrite: true,
                clobber: true,
                preserveTimestamps: true,
              }),
            ]);
          })  
          .then(() => { //check to make sure there arent two config files (both a json and a js file, if there are both, use the json file)
            return fs.readdir(path.join(this.config.app_root, 'content/config'));
          })
          .then(configFiles => {
            if (configFiles.indexOf('config.json') !== -1 && configFiles.indexOf('config.js') !== -1) {
              resolve(fs.remove(path.join(this.config.app_root, 'content/config/config.js')));
            } else {
              resolve(true);
            }
          })
          .catch(reject);
      }
    } catch (e) {
      reject(e);
    }
  });
}
module.exports = setUpFolderStructure;