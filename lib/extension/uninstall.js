'use strict';

function uninstallExtension(arg) {
  return new Promise((resolve, reject) => {
    try {
      if (arg === 'throw') throw new Error('Throw an error');
      // console.log('installing extension');
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  uninstallExtension,
};