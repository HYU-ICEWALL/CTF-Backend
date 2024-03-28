const { Schema } = require('mongoose');

const problemSchema = new Schema({
  id: String,
  name: String,
  src: String,
  flag: String,
  link: String,
  desc: String,
  category: Number
});

module.exports = problemSchema;