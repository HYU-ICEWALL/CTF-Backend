const { Schema } = require('mongoose');

const profileSchema = new Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true},
  name: { type: String, required: true },
  organization: { type: String, required: true },
  department: { type: String, required: true },
  solved: { type: [String], default: [] },
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
module.exports = profileSchema;