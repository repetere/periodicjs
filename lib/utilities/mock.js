'use strict';

function tempPromise(arg) {
  return new Promise((resolve, reject) => {
    try {
      if (arg === 'throw') throw new Error('Throw an error');
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  tempPromise,
};