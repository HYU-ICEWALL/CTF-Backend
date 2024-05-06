const { Schema } = require('mongoose');

const scoreboardSchema = new Schema({
  id: Number,
  solved: Array,
});

module.exports = scoreboardSchema;