'use strict';
const bcrypt = require('bcrypt');

function comparePassword(options) {
  const { candidatePassword, userPassword, } = options;
  return new Promise((resolve, reject) => {
    if (!userPassword) return reject(new Error('Invalid Password'));
    try {
      bcrypt.compare(candidatePassword, userPassword, (err, isMatch) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(isMatch)
        }
      });
    } catch (e) {
      return reject(e);
    }
  });
};

function hasPrivilege(options) {
  const { user, privilege, } = options;
  // console.log(' hasPrivilege user, privilege',user,privilege);
  return user.accounttype === 'admin' || user.privileges[privilege];
};

function generateRandomToken() {
	// var user = this,
	var chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
		token = new Date().getTime() + '_';
	for (var x = 0; x < 16; x++) {
		var i = Math.floor(Math.random() * 62);
		token += chars.charAt(i);
	}
	return token;
};

function encryptPassword(options) {
  const { password, saltLength = 10, } = options;
  return new Promise((resolve, reject) => {
    try {
      bcrypt.genSalt(saltLength, (err, salt) => {
        if (err) {
          return reject(err);
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              return reject(err);
            } else {
              return resolve(hash);
            }
          });
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  encryptPassword,
  comparePassword,
  hasPrivilege,
  generateRandomToken,
};