'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const fs = require('fs-extra');
const path = require('path');
const packageJson = fs.readJsonSync(path.join(__dirname, '../package.json'));
const preTransforms = periodic.utilities.middleware.preTransforms(periodic);

extensionRouter.all(packageJson.name, preTransforms, (req, res) => {
  res.send(`EXTENSION ${packageJson.name}`);
});

module.exports = extensionRouter;