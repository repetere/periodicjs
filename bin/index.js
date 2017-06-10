#! /usr/bin/env node

'use strict';

const program = require('commander');
const path = require('path');
const fs = require('fs-extra');
const colors = require('colors');
let process_dir = process.cwd();
let child;

program
  .version(require('../package').version)
  .option('-a, --all', 'all environments');


var run_cmd = function(cmd, args, callback, env) {
  var spawn = require('child_process').spawn;

  if (env) {
    child = spawn(cmd, args, env);
  } else {
    child = spawn(cmd, args);
  }

  child.stdout.on('error', function(err) {
    console.error(err);
    process.exit(0);
  });

  child.stdout.on('data', function(buffer) {
    console.log(buffer.toString());
  });

  child.stderr.on('data', function(buffer) {
    console.error(buffer.toString());
  });

  child.on('exit', function() {
    callback(null, 'command run: ' + cmd + ' ' + args);
    process.exit(0);
  });
};


function container(name, func, args) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--command', '--container', `--name=${name}`, `--task=${func}`, `--args=${args}`, ], function(err, text) { console.log(text.green.underline) });
      return resolve(true);
    } catch (err) {
      return reject(err);
    }
  });
}

function crud(entity, operation, args) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', `--crud=${entity}`, `--crud_op=${operation}`, `--crud_args=${args}`, ], function(err, text) { console.log(text.green.underline) });
      return resolve(true);
    } catch (err) {
      return reject(err);
    }
  });
}

function extension(ext, func, args) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--command', '--ext', `--name=${ext}`, `--task=${func}`, `--args=${args}`, ], function(err, text) { console.log(text.green.underline) });
      return resolve(true);
    } catch (err) {
      return reject(err);
    }
  });
}

function repl(args) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--repl', ], function(err, text) { console.log(text.green.underline) });
      return resolve(true);
    } catch (err) {
      return reject();
    }
  });
}

function setup(name) {
  return new Promise((resolve, reject) => {
    try {
      const projectname = name || 'my-app-server';
      const project_app_root = path.join(process_dir, projectname);
      const project_package_json_path = path.join(project_app_root, 'package.json');
      const setup_directory = path.resolve(__dirname, './__SETUP');
      const periodicPackageJson = require('../package');
      fs.ensureDir(project_app_root)
        .then(() => {
          return fs.copy(setup_directory, project_app_root, { overwrite: false, });
        })
        .then(() => {
          return fs.readJSON(project_package_json_path);
        })
        .then(projectPackageJson => {
          const updatedPackageJson = Object.assign({}, projectPackageJson);
          updatedPackageJson.name = projectname;
          updatedPackageJson.dependencies.periodicjs = periodicPackageJson.version;
          return fs.outputJSON(project_package_json_path, updatedPackageJson, { spaces: 2 });
        })
        .then(updated => {
          console.log(`New Periodic Application ${projectname} setup successfully.`);
          console.log(`Run: cd ${projectname} && npm install && npm start, to start your application`);
          resolve(true);
        })
        .catch(reject);
    } catch (err) {
      return reject(err);
    }
  });
}

program
  .command('setup [name]')
  .description('create a new periodic application')
  .action(function(name) {
    try {
      setup(name);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('repl')
  .description('')
  .action(function() {
    try {
      repl(arguments);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('extension <ext> <func>')
  .description('')
  .action(function(ext, func) {
    try {
      if (!ext || !func) console.log('Please specify an extension and task');
      extension(ext, func, arguments);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('container <name> <func>')
  .description('')
  .action(function(name, func) {
    try {
      if (!name || !func) console.log('Please specify an container name and task');
      container(name, func, arguments);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('crud <entity> <operation> [args]')
  .description('')
  .action(function(entity, operation, args) {
    try {
      if (!entity || !operation) console.log('Please specify an entity and operation');
      crud(entity, operation, args);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program.parse(process.argv);