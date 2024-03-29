const { Schema } = require('mongoose');

const problemSchema = new Schema({
  id: String,
  name: String,
  description: String,
  source: String,
  flag: String,
  link: String,
  category: Number
});

module.exports = problemSchema;