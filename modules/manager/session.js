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
    try{
      const session = req.session;
      if (!session || !session.data) {
        return new APIError(2501, 'Session not found');
      }
      const data = JSON.parse(session.data);
      if (!data.id || !data.token) {
        return new APIError(2502, 'Session data not found');
      }
    
      this.connect_ip[data.id] = req.ip; 
  
      return new APIResponse(0, {});
    }catch(err){
      console.error(err);
      return new APIError(2500, 'Session check failed');
    }
  }

  // createSession = async (req, id) => {
  //   try {
  //     const token = this.createSessionToken();
  //     const data = {
  //       id: id,
  //       token: token,
  //     };
  //     req.session.data = JSON.stringify(data);
  //     return new APIResponse(0, data);
  //   } catch (err) {
  //     console.error(err);
  //     return new APIError(2510, 'Session create failed');
  //   }
  // }

  // deleteSession = async (req) => {
  //   try {
  //     const sessionResult = await this.checkValidSession(req);
  //     if (sessionResult instanceof APIError) {
  //       return sessionResult;
  //     }
  //     req.session.destroy((err) => {
  //       if (err) {
  //         return new APIError(2521, 'Session delete failed');
  //       }
  //       return new APIResponse(0, {});
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     return new APIError(2520, 'Session delete failed');
  //   }
  // }
}

module.exports = SessionManager