const { Schema, SchemaType } = require('mongoose');

const scoreboardSchema = new Schema({
  contest: { type: String, unique: true, required: true }, // contest name
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  submissions: { type: [Object], default: [] },
  test: { type: Boolean, required: true, default: false }
});

/*
submission : [
  {
    problem : problem _id,
    score : problem score,
    account : account _id,
    type : true / false,
    time : time (YYYY-MM-DD HH:MM:SS)
  }
]
*/
module.exports = scoreboardSchema;