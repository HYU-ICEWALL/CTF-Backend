require('dotenv').config();
const { v4 } = require("uuid");
const session = require('express-session');

const { APIResponse, APIError } = require('../response');

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

  checkValidSession = async (session) => {
    if (!session) {
      return new APIError(603, 'Session not found');
    }
    console.log(session);
    session = JSON.parse(session);
    if (!session.data || !session.data.token || !session.data.id) {
      return new APIError(603, 'Session not found');
    }
  }
}

module.exports = SessionManager