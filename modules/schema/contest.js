const { Schema } = require('mongoose');

const contestSchema = new Schema({
  id: String,
  name: String,
  manager: String,
  problems: Array, // Array of problem _ids
  begin_at: String,
  duration: String,
  participants: Array // Array of account _ids
});

module.exports = contestSchema;