'use strict';
const path = require('path');
const fs = require('fs-extra');
const __STRUCTURE_DIR = path.resolve(__dirname, '../../__STRUCTURE');


/**
 * this will setup a periodic application folder structure if one doesnt exist, it will not overwrite existing configs
 * 
 * @returns Promise setUpFolderStructure will copy folders from the application __STRUCTURE directory to initialize the application
 */
function setUpFolderStructure() {
  return fs.copy(__STRUCTURE_DIR, this.config.app_root, {
    overwrite: false,
    clobber: false,
    preserveTimestamps: true,
  });
}
module.exports = setUpFolderStructure;