'use strict';
const Promisie = require('promisie');
const path = require('path');
const fs = Promisie.promisifyAll(require('fs-extra'));

function loadConfiguration() {
  const __CONFIG_DIR = path.resolve(this.config.app_root, 'content/config');
  const __CONFIG_JSON_PATH = path.join(__CONFIG_DIR, 'config.json');
  console.log('config this', this, {
    __CONFIG_DIR,
    __CONFIG_JSON_PATH,
  });
  return new Promise((resolve, reject) => {
    try {
      resolve(this);
      // fs.copyAsync(__CONFIG_DIR, this.config.app_root, {
      //     overwrite: false,
      //     clobber: false,
      //     preserveTimestamps: true,
      //   })
      //   .then(directories => {
      //     // console.log({ directories });
      //     resolve(directories);
      //   }).catch(reject);
    } catch (e) {
      reject(e);
    }
  })
}
module.exports = loadConfiguration;