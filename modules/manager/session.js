require('dotenv').config();
const { v4 } = require("uuid");
const session = require('express-session');
const RedisStore = require('connect-redis').default;

class SessionManager{
  constructor(database){
    this.database = database;
    this.option = {
      store: new RedisStore({ client: this.database.client }), 
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        httpOnly: true,
        ttl: parseInt(process.env.SESSION_EXPIRED)
      }
    };

    this.session = session(this.option);
  }
  
  createSessionToken = () => {
    const token = v4().split('-');
    return token[2] + token[1] + token[0] + token[3] + token[4];
  }
}

module.exports = SessionManager