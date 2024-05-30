const { Schema } = require('mongoose');

const problemSchema = new Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
  file: { type: String },
  flag: { type: String },
  url: {type: String},
  port: {type: String},
  score: { type: Number, required: true },
  domain: { type: String, required: true }, // pwn, web, forensic, reverse, misc
  contest: { type: String }, // contest name
  test: { type: Boolean, required: true, default: false },
});

module.exports = problemSchema;