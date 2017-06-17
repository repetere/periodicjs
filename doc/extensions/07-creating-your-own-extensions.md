# Creating extensions - `$ periodicjs createExtension [name-of-extension]` 

You can use the periodic CLI to create the scaffolding for a new extension. Internally the CLI command uses periodic's crud methods to scaffold your extension

```console
$ cd path/to/application_root
$ npm i [name-of-extension]
$ periodicjs createExtension [name-of-extension]
$ #alternatively 
$ node [path/to/app_root/]index.js --cli --crud=ext --crud_op=init --crud_arg=[name-of-extension] 
```

Have the command, you will have a new extension created in your node modules folder, with scaffolding for the 7 features


```javascript
 // app_root/node_modules/[name-of-extension]
.coveralls.yml //placeholder for coveralls.io integration
.eslintrc.json //default eslint rules
.travis.yml //placeholder for travis-ci.org integration
Gruntfile.js //auto-generated Grunt file for documentation and tests
README.md //auto-generated readme
commands //directory for CLI commands
config //directory for default settings
controllers //directory for express router middleware functions
index.js //default extension module
jsdoc.json //default jsdoc settings
package.json //auto generated package.json file
periodicjs.ext.json //auto generated extension manifest
resources //placeholder for front-end scripts
routers //directory for express routes
test //auto generated tests
transforms //placeholder directory for data transforms
utilities // directory for app.locals.extensions properties
views // front-end views directories
```