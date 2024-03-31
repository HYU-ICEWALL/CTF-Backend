require('dotenv').config();
const { v4 } = require("uuid");
const session = require('express-session');

class SessionManager{
  constructor(database, option){
    this.database = database;
    this.option = option;

    this.session = session(this.option);
  }
  
  createSessionToken = () => {
    const token = v4().split('-');
    return token[2] + token[1] + token[0] + token[3] + token[4];
  }
}

module.exports = SessionManager