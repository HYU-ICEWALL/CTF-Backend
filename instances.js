require('dotenv').config();
const RedisDatabase = require('./modules/database/redis');
const SessionManager = require('./modules/manager/session');
const Mongoose = require('./modules/database/mongodb');
const RedisStore = require('connect-redis').default;

const accountSchema = require('./modules/schema/account');
const problemSchema = require('./modules/schema/problem');
const contestSchema = require('./modules/schema/contest');
const profileSchema = require('./modules/schema/profile');
const scoreboardSchema = require('./modules/schema/scoreboard');

const ProblemManager = require('./modules/manager/problem');
const ContestManager = require('./modules/manager/contest');
const AccountManager = require('./modules/manager/account');
const ProfileManager = require('./modules/manager/profile');
const ScoreboardManager = require('./modules/manager/scoreboard');

const redisSessionDBName = 'redisSessionDB';
const redisSessionDB = new RedisDatabase(redisSessionDBName, {
  socket: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    connectTimeout: 100000
  },
  password: process.env.REDIS_PASSWORD,
  legacyMode: false,
});

const sessionManager = new SessionManager(redisSessionDB, {
  store: new RedisStore({ client: redisSessionDB.client }),
  name: "icewall_session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    httpOnly: false,
    // maxAge: parseInt(process.env.SESSION_EXPIRED),
  }
});


const mongoDBURL = process.env.MONGO_DB_URL;
const mongoDBName = 'mongodb';
const mongoDB = new Mongoose(mongoDBName, {
  "account": accountSchema,
  "problem": problemSchema,
  "contest": contestSchema,
  "profile": profileSchema,
  "scoreboard": scoreboardSchema
}, mongoDBURL);


const accountManager = new AccountManager(mongoDB, "account");
const problemManager = new ProblemManager(mongoDB, "problem");
const contestManager = new ContestManager(mongoDB, "contest");
const profileManager = new ProfileManager(mongoDB, "profile");
const scoreboardManager = new ScoreboardManager(mongoDB, "scoreboard");

const run = async () => {
  await mongoDB.connect();
  await redisSessionDB.connect();
}

module.exports = {
  sessionManager,
  accountManager,
  problemManager,
  contestManager,
  profileManager,
  scoreboardManager,
  run
}