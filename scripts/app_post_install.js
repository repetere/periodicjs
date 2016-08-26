'use strict';
/*
 * periodic
 * http://github.com/typesettin/periodic
 *
 * Copyright (c) 2016 Yaw Joseph Etse. All rights reserved.
 */

const Promisie = require('promisie');
const fs = Promisie.promisifyAll(require('fs-extra'));
const path = require('path');
const npmhelper = require('./npmhelper')({ npmhelper_from_installer: true });
const npmcleaninstall = require('./npm_clean_install');
const deploy_sync = require('./npm_deploymentsync');
const async = require('async');
const Utilities = require('periodicjs.core.utilities');
const CoreUtilities = new Utilities({});
const skip_app_post_install = ((typeof process.env.npm_config_skip_app_post_install !== 'undefined' && process.env.npm_config_skip_app_post_install) || (typeof process.env.npm_config_skip_post_install !== 'undefined' && process.env.npm_config_skip_post_install)) ? true : false;
var periodic_module_resources = path.join(__dirname, '../');
var installation_resources = path.join(__dirname, 'install_resources');
var application_root = path.resolve(process.cwd(), '../../'); // process.cwd();// path.resolve(__dirname,'../../../');
var install_errors = [];
var already_installed = false;
var custom_clean_install = false;

// console.log('__dirname',__dirname);
// console.log('process.cwd()',process.cwd());
// console.log('application_root',application_root);

/**
 * create log directory
 * @return {[type]} [description]
 */
let create_log_directory = function() {
  let application_root_log_dir = application_root;
  try {
    if (fs.readJsonSync(path.join(process.cwd(), 'package.json')).name !== 'periodicjs') {
      already_installed = true;
      // application_root_log_dir = process.cwd();
    } else {
      let installed_node_periodic_package_json = fs.readJsonSync(path.join(path.resolve(process.cwd(), '../../'), 'package.json'), { thows: false });
      if (installed_node_periodic_package_json && installed_node_periodic_package_json.name !== 'periodicjs') {
        already_installed = true;
      }
    }

  } catch (e) {

  }
  // console.log('--------------------------');
  // console.log('---create_log_directory---');
  // console.log('--------------------------');
  // console.log('already_installed',already_installed);
  // console.log('application_root',application_root);
  // console.log('application_root_log_dir',application_root_log_dir);
  return Promise.all([
    fs.ensureDirAsync(path.join(application_root_log_dir, 'logs')),
    fs.ensureDirAsync(path.join(application_root_log_dir, 'cache')),
    fs.ensureDirAsync(path.join(application_root_log_dir, 'process'))
  ]);
};

/**
 * create git ignore file if one doesnt exist, based off of the npm ignore file
 * @return {[type]} [description]
 */
let create_project_files = function() {
  if (already_installed) {
    return true;
  } else {
    return Promise.all([
      fs.copyAsync(path.join(__dirname, '../.npmignore'), path.join(application_root, '../.gitignore'), { clobber: false }),
      // fs.copyAsync(path.join(__dirname,'../.npmignore'), path.join(application_root,'./.npmignore'),{clobber:false}),
    ]);
  }
};

/**
 * Test whether periodic project has a package json file
 * @param  {[type]} resolve     [description]
 * @param  {[type]} reject){} [description]
 * @return {Promise}             package check promise
 */
let project_package_json = function() {
  try {
    // let dir_root = (already_installed) ? path.join(process.cwd(),'node_modules/periodicjs/scripts') : __dirname ;
    let package_json_filename = 'package.json';
    // periodic_module_resources = (already_installed) ? path.join(process.cwd(),'node_modules/periodicjs') : periodic_module_resources ;
    // installation_resources = (already_installed) ? path.join(dir_root,'install_resources') : installation_resources ;
    // application_root= (already_installed) ? process.cwd() : application_root;
    let node_modules_scripts_resources_package_file_path = path.join(installation_resources, package_json_filename);
    let node_modules_package_file_path = path.join(periodic_module_resources, package_json_filename);
    let application_package_file_path = path.join(application_root, package_json_filename);

    let node_modules_scripts_resources_package_data = {};
    let node_modules_package_data = {};
    let application_package_file_data = false;
    let skip_update_package_json = false;
    let original_project_package_json = {};
    // console.log('--------------------------');
    // console.log('---project_package_json---');
    // console.log('--------------------------');
    // console.log('project_package_json status');
    // console.log('__dirname',__dirname);
    // console.log('periodic_module_resources',periodic_module_resources);
    // console.log('node_modules_scripts_resources_package_file_path',node_modules_scripts_resources_package_file_path);
    // console.log('node_modules_package_file_path',node_modules_package_file_path);
    // console.log('application_package_file_path',application_package_file_path);
    // console.log('already_installed',already_installed);

    node_modules_scripts_resources_package_data = fs.readJsonSync(node_modules_scripts_resources_package_file_path, { throws: false });
    node_modules_package_data = fs.readJsonSync(path.join(node_modules_package_file_path), { throws: false });

    try {
      application_package_file_data = fs.readJsonSync(application_package_file_path, { throws: false });

      // console.log('application_package_file_data',application_package_file_data)
      if (application_package_file_data) {
        // console.log('application_package_file_path',application_package_file_path)
        already_installed = true;
        // application_root=process.cwd();
      }
    } catch (e) {
      let errorRegExp = /no such file or directory/gi;
      if (!e.message.match(errorRegExp)) {
        install_errors.push(e);
      }
    }
    if (already_installed && application_package_file_data === false) {
      console.log('****************************')
      console.log('***ALREADY INSTALLED NPM ***')
      console.log('****************************')
      return true;
    } else {
      console.log('****************************')
      console.log('*** NEW INSTALL VIA NPM! ***')
      console.log('****************************')
      let custom_app_package_json = Object.assign({}, node_modules_package_data, node_modules_scripts_resources_package_data);
      if (application_package_file_data && application_package_file_data.name) {
        custom_app_package_json.name = (application_package_file_data.name) ? application_package_file_data.name : custom_app_package_json.name;
        custom_app_package_json.license = (application_package_file_data.license) ? application_package_file_data.license : custom_app_package_json.license;
        custom_app_package_json.readme = (application_package_file_data.readme) ? application_package_file_data.readme : custom_app_package_json.readme;
        custom_app_package_json.description = (application_package_file_data.description) ? application_package_file_data.description : custom_app_package_json.description;
        custom_app_package_json.repository = (application_package_file_data.repository) ? application_package_file_data.repository : custom_app_package_json.repository;
        custom_app_package_json.author = (application_package_file_data.author) ? application_package_file_data.author : custom_app_package_json.author;
        custom_app_package_json.contributors = (application_package_file_data.contributors) ? application_package_file_data.contributors : custom_app_package_json.contributors;
        custom_app_package_json.keywords = (application_package_file_data.keywords) ? application_package_file_data.keywords : custom_app_package_json.keywords;
        custom_app_package_json.maintainers = (application_package_file_data.maintainers) ? application_package_file_data.maintainers : custom_app_package_json.maintainers;
        custom_app_package_json.optionalDependencies = (application_package_file_data.optionalDependencies) ? application_package_file_data.optionalDependencies : custom_app_package_json.optionalDependencies;
      }

      Object.keys(custom_app_package_json).forEach((prop) => {
        if (prop.charAt(0) === '_') {
          delete custom_app_package_json[prop];
        }
      });

      return fs.outputJsonAsync(application_package_file_path, custom_app_package_json, { spaces: 2 });

    }


  } catch (e) {
    return new Promise((resolve, reject) => {
      console.error('project_package_json uncaught error', e.stack);
      reject(e);
    });
  }
};

/**
 * Test whether periodic project has an index file
 * @param  {[type]} resolve     [description]
 * @param  {[type]} reject){} [description]
 * @return {[type]}             [description]
 */
let project_files_copy = function() {
  let project_index_filename = 'index.js';
  let project_index_path = path.join(periodic_module_resources, project_index_filename);
  let application_root_path = path.join(application_root, project_index_filename);
  let application_package_file_data = false;
  let application_package_file_path = path.join(application_root, 'package.json');

  try {
    application_package_file_data = fs.readJsonSync(application_package_file_path, { throws: false });
    console.log('project_files_copy application_package_file_data', application_package_file_data)
  } catch (e) {
    let errorRegExp = /no such file or directory/gi;
    if (!e.message.match(errorRegExp)) {
      install_errors.push(e);
    }
  }

  if (already_installed && application_package_file_data === false) {
    console.log('****************************');
    console.log('***NOT COPYING SAME FILES***');
    console.log('****************************');
    return true;
  } else {
    console.log('****************************');
    console.log('*** COPYING PERIODIC DIR ***');
    console.log('****************************');
    // console.log('------------------------');
    // console.log('---project_files_copy---')
    // console.log('------------------------');
    // console.log('project_index_path',project_index_path);
    // console.log('application_root_path',application_root_path);
    // console.log('periodic_module_resources',periodic_module_resources);
    // console.log('application_root',application_root);
    return Promise.all([
      fs.copyAsync(project_index_path, application_root_path, { clobber: true }), //index.js
      fs.copyAsync(path.join(periodic_module_resources, 'scripts'), path.join(application_root, 'scripts'), { clobber: true }),
      fs.copyAsync(path.join(periodic_module_resources, 'nodemon.json'), path.join(application_root, 'nodemon.json'), { clobber: true }),
      fs.copyAsync(path.join(periodic_module_resources, '.eslintrc.json'), path.join(application_root, '.eslintrc.json'), { clobber: false }),
      fs.copyAsync(path.join(periodic_module_resources, 'typings.json'), path.join(application_root, 'typings.json'), { clobber: false }),
      fs.copyAsync(path.join(periodic_module_resources, 'Gruntfile.js'), path.join(application_root, 'Gruntfile.js'), { clobber: true }),
      fs.copyAsync(path.join(periodic_module_resources, 'jsdoc.json'), path.join(application_root, 'jsdoc.json'), { clobber: true }),
      fs.copyAsync(path.join(periodic_module_resources, 'test'), path.join(application_root, 'test'), { clobber: true }),
      fs.copyAsync(path.join(periodic_module_resources, 'content'), path.join(application_root, 'content'), { clobber: false }),
      fs.copyAsync(path.join(periodic_module_resources, 'public'), path.join(application_root, 'public'), { clobber: false }),
      fs.copyAsync(path.join(periodic_module_resources, 'app'), path.join(application_root, 'app'), { clobber: true }),
    ]);
  }
};

/**
 * test if periodic is already installed, if so run deploysync, otherwise install standard extensions
 * @return {[type]} [description]
 */
let install_extensions = function() {
  let application_extensions = false;
  let application_extensions_path = path.join(application_root, 'content/config/extensions.json');
  let app_root_to_use;
  let clean_install_options = (custom_clean_install) ? {
    prefixpath: process.cwd()
  } : {};
  try {
    application_extensions = fs.readJsonSync(application_extensions_path, { throws: false });
    app_root_to_use = application_root;
  } catch (e) {
    let errorRegExp = /no such file or directory/gi;
    if (!e.message.match(errorRegExp)) {
      install_errors.push(e);
    }
  }
  try {
    if (fs.readJsonSync(path.join(process.cwd(), 'package.json')).name !== 'periodicjs') {
      application_extensions = fs.readJsonSync(path.join(process.cwd(), 'content/config/extensions.json'), { throws: false });
      app_root_to_use = process.cwd();
    }
  } catch (e) {
    let errorRegExp = /no such file or directory/gi;
    if (!e.message.match(errorRegExp)) {
      install_errors.push(e);
    }
  }

  if (application_extensions && already_installed) {
    console.log('Periodic Already Installed, Upgrading', 'app_root_to_use', app_root_to_use);
    return deploy_sync.deploy_sync_promise({ application_root: app_root_to_use });
  } else {
    console.log('New Periodic Installation');
    return npmcleaninstall.installStandardExtensionsAsync(clean_install_options);
  }
};

let install_complete_callback = function(result) {
  if (already_installed) {
    console.log('post install deploysync result', result);
    CoreUtilities.restart_app({});
  }
  console.log('Installed Periodic');
  if (install_errors.length > 0) {
    console.log('Install Warnings', install_errors);
  }
  process.exit(0);
};

let install_error_callback = function(e) {
  console.error('Could not install Periodic');
  console.error(e, e.stack);
  process.exit(0);
};

//install the new periodic
if (skip_app_post_install) {
  custom_clean_install = true;
  install_extensions()
    .then(install_complete_callback)
    .catch(install_error_callback);
} else {
  create_log_directory()
    .then(() => {
      return create_project_files();
    })
    .then(() => {
      return project_package_json();
    })
    .then(() => {
      return project_files_copy();
    })
    .then(() => {
      return install_extensions();
    })
    .then(install_complete_callback)
    .catch(install_error_callback);
}