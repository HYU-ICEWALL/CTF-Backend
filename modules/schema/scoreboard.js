const { Schema } = require('mongoose');

const scoreboardSchema = new Schema({
  contest: { type: String, required: true },
  begin_at: { type: String, required: true },
  duration: { type: String, required: true },
  solved: { type: Array, required: true },
});

module.exports = scoreboardSchema;