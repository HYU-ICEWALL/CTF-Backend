const { Schema } = require('mongoose');

const problemSchema = new Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String },
  source: { type: String, required: true },
  flag: { type: String, required: true },
  link: { type: String, required: true },
  score: { type: String, required: true },
  category: { type: String, required: true },
  contest: { type: String }
});

module.exports = problemSchema;