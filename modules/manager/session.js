require('dotenv').config();
const { v4 } = require("uuid");
const session = require('express-session');

const { APIResponse, APIError } = require('../response');

class SessionManager{
  constructor(database, option){
    this.database = database;
    this.option = option;
    this.session = session(this.option);
    this.connect_ip = {}
  }
  
  createSessionToken = () => {
    const token = v4().split('-');
    return token[2] + token[1] + token[0] + token[3] + token[4];
  }

  checkValidSession = async (req) => {
    const session = req.session;
    if (!session || !session.data) {
      return new APIError(603, 'Session not found');
    }
    const data = JSON.parse(session.data);
    if (!data.id || !data.token) {
      return new APIError(604, 'Session data not found');
    }

    const result = await this.database.client.keys("sess:*");
    console.log(result);
    this.connect_ip[data.id] = req.ip; 

    return new APIResponse(0, {});
  }
}

module.exports = SessionManager