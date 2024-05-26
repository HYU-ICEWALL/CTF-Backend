const { Schema } = require('mongoose');

const contestSchema = new Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
  problems: { type: [String], required: true},  // problem name
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  participants: { type: [String], required: true }, // account id
  state: { type: String, required: true, default: '0' }, // 0 : upcoming, 1 : in progress, 2 : ended, 3 : suspended
  test: { type: Boolean, required: true, default: false },
});

module.exports = contestSchema;