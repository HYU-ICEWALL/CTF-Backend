const { Schema } = require('mongoose');

const problemSchema = new Schema({
  id: String,
  name: String,
  description: String,
  source: String,
  flag: String,
  link: String,
  score: Number,
  category: Number
});

module.exports = problemSchema;