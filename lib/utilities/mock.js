'use strict';
function tempPromise() {
  return new Promise((resolve, reject) => {
    try {
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  tempPromise,
};