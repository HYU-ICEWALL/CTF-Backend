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

  checkValidSession = async (cookie, session) => {
    if(!cookie || !session || Object.keys(cookie).length === 0 || Object.keys(session).length === 0 || !session.token || !session.id){
      return new APIError(602, 'Session not found');
    }
    
    if (session.token != cookie.token || session.id != cookie.id) {
      return new APIError(611, 'Cookie malformed');
    }

    return new APIResponse(0, null);
  }
}

module.exports = SessionManager