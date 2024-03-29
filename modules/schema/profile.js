const { Schema } = require('mongoose');

const profileSchema = new Schema({
  id: String,
  email: String,
  name: String,
  organization: String,
  department: String,
});

module.exports = profileSchema;