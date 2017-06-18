# newtestext [![Coverage Status](https://coveralls.io/repos/github/githubUserOrgName/newtestext/badge.svg?branch=master)](https://coveralls.io/github/githubUserOrgName/newtestext?branch=master) [![Build Status](https://travis-ci.org/githubUserOrgName/newtestext.svg?branch=master)](https://travis-ci.org/githubUserOrgName/newtestext)

A simple extension.

[API Documentation](https://github.com/githubUserOrgName/newtestext/blob/master/doc/api.md)

## Usage

### CLI TASK

You can preform a task via CLI
```
$ cd path/to/application/root
### Using the CLI
$ periodicjs ext newtestext hello  
### Calling Manually
$ node index.js --cli --command --ext --name=newtestext --task=hello 
```

## Configuration

You can configure newtestext

### Default Configuration
```javascript
{
  settings: {
    defaults: true,
  },
  databases: {
  },
};
```


## Installation

### Installing the Extension

Install like any other extension, run `npm run install newtestext` from your periodic application root directory and then run `periodicjs addExtension newtestext`.
```
$ cd path/to/application/root
$ npm run install newtestext
$ periodicjs addExtension newtestext
```
### Uninstalling the Extension

Run `npm run uninstall newtestext` from your periodic application root directory and then run `periodicjs removeExtension newtestext`.
```
$ cd path/to/application/root
$ npm run uninstall newtestext
$ periodicjs removeExtension newtestext
```


## Testing
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt test or npm test
```
$ grunt test && grunt coveralls #or locally $ npm test
```
For generating documentation
```
$ grunt doc
$ jsdoc2md commands/**/*.js config/**/*.js controllers/**/*.js  transforms/**/*.js utilities/**/*.js index.js > doc/api.md
```
##Notes
  * Check out https://github.com/typesettin/periodicjs for the full Periodic Documentation