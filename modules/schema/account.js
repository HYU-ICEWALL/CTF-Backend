const { Schema } = require('mongoose');

const accountSchema = new Schema({
  id: String,
  password: String,
  salt: String,
  email: String,
  verified: Boolean,
  authority: Number // 0 : User, 1 : Admin
});

module.exports = accountSchema;