const { Schema, SchemaType } = require('mongoose');

const scoreboardSchema = new Schema({
  contest: { type: Schema.ObjectId, required: true },
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  // solved: { type: [Object], default: [] },
  sumbissions: { type: [Object], default: [] },
});

/*
submission : [
  {
    problem : problem id,
    score : problem score,
    account : account id,
    type : type (0 : submit, 1 : correct, 2 : incorrect),
    time : time (YYYY-MM-DD HH:MM:SS)
  }
]
*/
module.exports = scoreboardSchema;