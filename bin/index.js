#! /usr/bin/env node

'use strict';
//https://developer.atlassian.com/blog/2015/11/scripting-with-node/

const program = require('commander');
const path = require('path');
const fs = require('fs-extra');
const colors = require('colors');
let process_dir = process.cwd();
let child;

program
  .version(require('../package').version)
  .option('-a, --all', 'all environments');


var run_cmd = function (cmd, args, callback, env, attach = false) {
  var spawn = require('child_process').spawn;
  var options = [cmd, args, {
    env
  }];
  if (attach === true) {
    options[2].stdio = [process.stdin, process.stdout, process.stderr];
    child = spawn(...options);
  } else {
    child = spawn(...options);
    child.stdout.on('error', err => {
      console.error(err);
      process.exit(1);
    })
      .on('data', data => {
        console.log(data.toString());
      });
  }
  child.on('exit', () => {
    callback(null, 'command run: ' + cmd + ' ' + args);
    process.exit(0);
  });
  process.on('exit', () => {
    child.kill();
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
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', `--crud=${entity}`, `--crud_op=${operation}`, `--crud_arg=${args}`, ], function(err, text) { console.log(text.green.underline) });
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
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--repl', ], function(err, text) { console.log(text.green.underline) }, undefined, true);
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
      const structure_directory = path.resolve(__dirname, '../__STRUCTURE');
      const periodicPackageJson = require('../package');
      fs.ensureDir(project_app_root)
        .then(() => {
          return Promise.all([
            fs.copy(setup_directory, project_app_root, { overwrite: false, }),
            fs.copy(structure_directory, project_app_root, { overwrite: false, }),
          ]);
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
          console.log(`Run: cd ${projectname} && npm install && npm start development, to start your application`);
          resolve(true);
        })
        .catch(reject);
    } catch (err) {
      return reject(err);
    }
  });
}

function createContainer(name) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--createContainer', `--name=${name}`, ], function(err, text) {
        console.log(text.green.underline);
      });
      return resolve(true);
    } catch (e) {
      return reject(e);
    }
  });
}

function createExtension(name) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--createExtension', `--name=${name}`, ], function(err, text) {
        console.log(text.green.underline);
      });
      return resolve(true);
    } catch (e) {
      return reject(e);
    }
  });
}

function addExtension(name) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--addExtension', `--name=${name}`, ], function(err, text) {
        console.log(text.green.underline);
      });
      return resolve(true);
    } catch (e) {
      return reject(e);
    }
  });
}

function removeExtension(name) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--removeExtension', `--name=${name}`, ], function(err, text) {
        console.log(text.green.underline);
      });
      return resolve(true);
    } catch (e) {
      return reject(e);
    }
  });
}

function createConfig(type, name, environment, filepath) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'),
        '--cli',
        '--createConfig',
        `--name=${name}`,
        `--type=${type}`,
        `--environment=${environment}`,
        `--filepath=${filepath}`,
      ], function(err, text) {
        console.log(text.green.underline);
      });
      return resolve(true);
    } catch (e) {
      return reject(e);
    }
  });
}

function addConfig(filepath) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--addConfig', `--filepath=${filepath}`, ], function(err, text) {
        console.log(text.green.underline);
      });
      return resolve(true);
    } catch (e) {
      return reject(e);
    }
  });
}

function removeConfig(id) {
  return new Promise((resolve, reject) => {
    try {
      run_cmd('node', [path.join(process_dir, 'index.js'), '--cli', '--removeConfig', `--id=${id}`, ], function(err, text) {
        console.log(text.green.underline);
      });
      return resolve(true);
    } catch (e) {
      return reject(e);
    }
  });
}

program
  .command('setup [name]')
  .alias('init')
  .alias('s')
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
  .alias('r')
  .description('start the periodic interactive shell')
  .action(function() {
    try {
      repl(arguments);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('extension <ext> <func> [args]')
  .alias('ext')
  .description('execute mounted extension asynchronous task')
  .action(function(ext, func, args) {
    try {
      if (!ext || !func) console.log('Please specify an extension and task');
      extension(ext, func, args);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('container <name> <func> [args]')
  .alias('con')
  .description('execute mounted container asynchronous task')
  .action(function(name, func, args) {
    try {
      if (!name || !func) console.log('Please specify an container name and task');
      container(name, func, args);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('crud <entity> <operation> [args]')
  .description('access to periodic\'s internal persistent storage faculties')
  .action(function(entity, operation, args) {
    try {
      if (!entity || !operation) console.log('Please specify an entity and operation');
      crud(entity, operation, args);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('createContainer <name>')
  .alias('createcontainer')
  .alias('ccn')
  .description('create a new container')
  .action(function(name) {
    try {
      createContainer(name);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });
program
  .command('createExtension <name>')
  .alias('createextension')
  .alias('cex')
  .description('create a new extension')
  .action(function(name) {
    try {
      createExtension(name);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });
program
  .command('addExtension <name>')
  .alias('addextension')
  .alias('aex')
  .description('add an extension to the extension database')
  .action(function(name) {
    try {
      addExtension(name);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });
program
  .command('removeExtension <name>')
  .alias('removeextension')
  .alias('rex')
  .description('remove an extension from the extension database')
  .action(function(name) {
    try {
      removeExtension(name);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('createConfig <type> <name> <environment> <filepath>')
  .alias('cco')
  .description('create a new Config')
  .action(function(type, name, environment, filepath) {
    try {
      createConfig(type, name, environment, filepath);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program
  .command('addConfig <filepath>')
  .alias('aco')
  .description('add an application configuration to the configuration database')
  .action(function(filepath) {
    try {
      addConfig(filepath);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });
program
  .command('removeConfig <id>')
  .alias('rco')
  .description('remove an application configuration from the configuration database')
  .action(function(id) {
    try {
      removeConfig(id);
    } catch (err) {
      console.log('Error running command - ', err);
      process.exit(0);
    }
  });

program.parse(process.argv);


// function toggleExtension(name) {
//   return new Promise((resolve, reject) => {
//     try {
//       run_cmd('node', [ path.join(process_dir, 'index.js'), '--cli', '--toggleExtension', `--name=${name}`, ], function (err, text) {
//         console.log(text.green.underline);
//       });
//       return resolve(true); 
//     } catch (e) {
//       return reject(e);
//     }
//   });
// }
// program
//   .command('toggleExtension <name>')
//   .description('toggle an extension enabled status in the extension database')
//   .action(function(name) {
//     try {
//       toggleExtension(name);
//     } catch (err) {
//       console.log('Error running command - ', err);
//       process.exit(0);
//     }
//   });