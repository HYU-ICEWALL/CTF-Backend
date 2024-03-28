const redis = require('redis');
const Database = require('./database');

class RedisDatabase extends Database {
  constructor(name, clientOptions) {
    super(name);
    this.clientOptions = clientOptions;

    
    this.client = redis.createClient(this.clientOptions);
    this.client.connect().then(() => {
      console.log(`Redis database ${this.name} connected...`);
    }).catch((error) => {
      console.error('Failed to connect to Redis database...');
      console.error(error);
    });
    this.client.on('error', (error) => {
      console.error('Failed to connect to Redis database...');
      console.error(error);
    });
  }

  async insertData(key, value){
    return await this.client.set(key, value);
  }
  async findData(key) {
    return await this.client.get(key);
  }
  async updateData(key, value) {
    return await this.client.set(key, value);
  }
  async deleteData(key) {
    return await this.client.del(key);
  }
}

module.exports = RedisDatabase;