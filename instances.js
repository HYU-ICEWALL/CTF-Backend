require('dotenv').config();
const RedisDatabase = require('./modules/database/redis');
const SessionManager = require('./modules/manager/session');
const Mongoose = require('./modules/database/mongodb');
const accountSchema = require('./modules/schema/account');
const problemSchema = require('./modules/schema/problem');
const contestSchema = require('./modules/schema/contest');
const ProblemManager = require('./modules/manager/problem');
const ContestManager = require('./modules/manager/contest');
const AccountManager = require('./modules/manager/account');

// const localAccountDBPath = __dirname + '/' + process.env.LOCAL_DB_PATH + '/account.json';
// const localAccountDBName = 'localAccountDB';
// const localAccountDB = new LocalDatabase(localAccountDBName, localAccountDBPath);
// const accountManager = new AccountManager(localAccountDB);

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
  "contest": contestSchema
}, mongoDBURL);
const accountManager = new AccountManager(mongoDB);
const problemManager = new ProblemManager(mongoDB);
const contestManager = new ContestManager(mongoDB);

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