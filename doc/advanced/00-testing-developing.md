# Testing and Developing Periodic

## Testing
*Make sure you have grunt installed*
```
$ npm install -g grunt-cli
```

Then run grunt test or npm test
```
$ grunt test && grunt coveralls #or locally $ npm test
```

## Documentation

For generating documentation, make sure you have jsdoc-to-markdown installed

```
$ npm install -g jsdoc-to-markdown
```
Then generate updated docs
```
$ grunt doc
$ jsdoc2md bin/**/*.js lib/**/*.js index.js > doc/api.md