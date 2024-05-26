const { Schema } = require('mongoose');

const contestSchema = new Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, unique: true, required: true },
  description: { type: String },
  problems: { type: [Schema.ObjectId], required: true},
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  participants: { type: [Schema.ObjectId], required: true },
});

module.exports = contestSchema;