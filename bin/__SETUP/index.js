'use strict';

const periodic = require('periodicjs');

periodic.init({
    debug: true,
  })
  .then(periodicInitStatus => {
    console.log({ periodicInitStatus });
  })
  .catch(e => {
    console.error(e);
  });