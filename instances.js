require('dotenv').config();
const RedisDatabase = require('./modules/database/redis');
const SessionManager = require('./modules/manager/session');
const Mongoose = require('./modules/database/mongodb');

const accountSchema = require('./modules/schema/account');
const problemSchema = require('./modules/schema/problem');
const contestSchema = require('./modules/schema/contest');
const profileSchema = require('./modules/schema/profile');

const ProblemManager = require('./modules/manager/problem');
const ContestManager = require('./modules/manager/contest');
const AccountManager = require('./modules/manager/account');
const ProfileManager = require('./modules/manager/profile');

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

const sessionManager = new SessionManager(redisSessionDB);


const mongoDBURL = process.env.MONGO_DB_URL;
const mongoDBName = 'mongodb';
const mongoDB = new Mongoose(mongoDBName, {
  "account": accountSchema,
  "problem": problemSchema,
  "contest": contestSchema,
  "profile": profileSchema,
}, mongoDBURL);
const accountManager = new AccountManager(mongoDB);
const problemManager = new ProblemManager(mongoDB);
const contestManager = new ContestManager(mongoDB);
const profileManager = new ProfileManager(mongoDB);

const run = async () => {
  await mongoDB.connect();
}

module.exports = {
  sessionManager,
  accountManager,
  problemManager,
  contestManager,
  run
}