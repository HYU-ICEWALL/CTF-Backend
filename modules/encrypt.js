const crypto = require('crypto');

const createSalt = (saltSize) => {
  return crypto.randomBytes(parseInt(saltSize)).toString('base64');
}

const encryptPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('base64');
}

module.exports = {
  createSalt,
  encryptPassword
}