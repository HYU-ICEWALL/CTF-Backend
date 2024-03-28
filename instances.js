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
const redisSessionDB = new RedisDatabase(redisSessionDBName);
const sessionManager = new SessionManager(redisSessionDB);


const mongoAccountDBName = 'account';
const mongoAccountDB = new Mongoose(mongoAccountDBName, accountSchema);
const accountManager = new AccountManager(mongoAccountDB);

const mongoProblemDBName = 'problem';
const mongoProblemDB = new Mongoose(mongoProblemDBName, problemSchema);
const problemManager = new ProblemManager(mongoProblemDB);

const mongoContestDBName = 'contest';
const mongoContestDB = new Mongoose(mongoContestDBName, contestSchema);
const contestManager = new ContestManager(mongoContestDB);

const run = async () => {
  await mongoAccountDB.connect();
  await mongoProblemDB.connect();
  await mongoContestDB.connect();
}

module.exports = {
  sessionManager,
  accountManager,
  problemManager,
  contestManager,

  run
}