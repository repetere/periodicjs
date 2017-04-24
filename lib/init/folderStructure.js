'use strict';
const Promisie = require('promisie');
const path = require('path');
const fs = Promisie.promisifyAll(require('fs-extra'));
const __STRUCTURE_DIR = path.resolve(__dirname, '../../__STRUCTURE');
// console.log(fs);

function setUpFolderStructure() {
  return new Promise((resolve, reject) => {
    try {
      fs.copyAsync( __STRUCTURE_DIR, this.config.app_root, {
        overwrite: false,
        clobber: false,
        preserveTimestamps: true,
      })
        .then(directories => {
          // console.log({ directories });
          resolve(directories);
        }).catch(reject);
    } catch (e) {
      reject(e);
    }
    // console.log('setUpFolderStructure', this,{fs});
    // resolve({ folders: 'all' });
  })
}
module.exports = setUpFolderStructure;


