'use strict';
const periodic = require('periodicjs');
function testPreTransform(req) {
  return new Promise((resolve, reject) => {
    periodic.logger.silly('sample pre transfrom', req.params.id);
    resolve(req);
  });
}
function testPostTransform(req) {
  return new Promise((resolve, reject) => {
    periodic.logger.silly('sample post transfrom', req.params.id);
    resolve(req);
  });
}

module.exports = {
  pre: {
    GET: {
      '/some/route/path/:id':[testPreTransform]
    },
    PUT: {
    }
  },
  post: {
    GET: {
      '/another/route/test/:id':[testPostTransform]
    },
    PUT: {
    }
  }
}