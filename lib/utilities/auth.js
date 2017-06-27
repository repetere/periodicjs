'use strict';
const bcrypt = require('bcrypt');

/**
 * compare a password hash to a user supplied password string
 * 
 * @param {string} options.candidatePassword encrypted password string 
 * @param {string} options.userPassword plain text password string
 * @returns {promise} resolved true or false if the password matches
 */
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

/**
 * tests if a user has a privilege
 * 
 * @param {object} options.user user to check privilege 
 * @param {string} options.privilege privilege string 
 * @returns 
 */
function hasPrivilege(options) {
  const { user, privilege, } = options;
  return user.accounttype === 'admin' || user.privileges[privilege];
};

/**
 * generates a random token, typically used for API keys
 * 
 * @returns {string} api token
 */
function generateRandomToken() {
	var chars = '_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
		token = new Date().getTime() + '_';
	for (var x = 0; x < 16; x++) {
		var i = Math.floor(Math.random() * 62);
		token += chars.charAt(i);
	}
	return token;
};


/**
 * encrypts password string with bcrypt
 * 
 * @param {string} options.password password string to encrypt
 * @param {number} options.saltLength length of generated salt
 * @returns {promise} resolved encrypted password hash
 */
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