const { Schema } = require('mongoose');

const contestSchema = new Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String },
  problems: { type: [String], required: true},
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  participants: { type: [String], required: true },
});

module.exports = contestSchema;