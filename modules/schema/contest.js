const { Schema } = require('mongoose');

const contestSchema = new Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String },
  problems: { type: Array, required: true},
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  participants: { type: Array, required: true },
});

module.exports = contestSchema;