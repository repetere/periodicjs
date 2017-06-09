'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const fs = require('fs-extra');
const packageJson = fs.readJsonSync('../package.json');

extensionRouter.all(packageJson.name, (req, res) => {
  res.send(`EXTENSION ${packageJson.name}`);
});

module.exports = extensionRouter;