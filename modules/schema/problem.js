const { Schema } = require('mongoose');

const problemSchema = new Schema({
  // id: { type: String, unique: true, required: true },
  name: { type: String, unique: true, required: true },
  description: { type: String },
  source: { type: String },
  flag: { type: String },
  link: { type: String },
  score: { type: String, required: true },
  category: { type: String, required: true },
  contest: { type: Schema.ObjectId }
});

module.exports = problemSchema;