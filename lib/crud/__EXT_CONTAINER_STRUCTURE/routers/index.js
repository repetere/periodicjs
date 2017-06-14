'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const fs = require('fs-extra');
const path = require('path');
const packageJson = fs.readJsonSync(path.join(__dirname,'../package.json'));

extensionRouter.all(packageJson.name, (req, res) => {
  res.send(`EXTENSION ${packageJson.name}`);
});

module.exports = extensionRouter;