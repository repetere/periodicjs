'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();

extensionRouter.all('/', (req, res) => {
  const viewtemplate = 'home/index';
  const viewdata = {
    periodic: {
      appname: periodic.settings.name,
    },
  };
  periodic.core.controller.renderView(req, res, viewtemplate, viewdata);
});

module.exports = extensionRouter;