const { Schema } = require('mongoose');

const accountSchema = new Schema({
  id: String,
  password: String,
  salt: String,
  email: String,
  uuid: String,
  verified: Boolean,
  authority: Number
});

module.exports = accountSchema;