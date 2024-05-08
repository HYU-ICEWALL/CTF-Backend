const { Schema, SchemaType } = require('mongoose');

const scoreboardSchema = new Schema({
  contest: { type: String, required: true },
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  solved: { type: [Object], default: [] },
});



/*
solved : [
  {
    problem : problem id,
    score : problem score,
    account : account id,
    time : time (YYYY-MM-DD HH:MM:SS)
  }
]
*/
module.exports = scoreboardSchema;