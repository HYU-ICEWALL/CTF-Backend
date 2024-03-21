require('dotenv').config();
const LocalDatabase = require("./modules/database/local");
const RedisDatabase = require('./modules/database/redis');
const SessionManager = require('./modules/manager/session');
const AccountManager = require('./modules/manager/account');

const localAccountDBPath = __dirname + '/' + process.env.LOCAL_DB_PATH + '/account.json';
const localAccountDBName = 'localAccountDB';
const localAccountDB = new LocalDatabase(localAccountDBName, localAccountDBPath);

const redisSessionDBName = 'redisSessionDB';
const redisSessionDB = new RedisDatabase(redisSessionDBName);
const sessionManager = new SessionManager(redisSessionDB);

const accountManager = new AccountManager(localAccountDB);

const run = async () => {
  await localAccountDB.connect();
  await localAccountDB.load();
}

module.exports = {
  localAccountDB,
  sessionManager,
  accountManager,
  run
}