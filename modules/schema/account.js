const { Schema } = require('mongoose');

const accountSchema = new Schema({
  id: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  salt: { type: String, required: true},
  email: { type: String, unique: true, required: true},
  uuid: { type: String, unique: true, required: true },
  verified: { type: Boolean, required: true, default: false },
  authority: { type: Number, required: true, default: 0 }
});

module.exports = accountSchema;