const redis = require('redis');
const Database = require('./database');

class RedisDatabase extends Database {
  constructor(name, clientOptions) {
    super(name);
    this.clientOptions = clientOptions;
    
    this.client = redis.createClient(this.clientOptions);
  }

  async connect(){
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

    this.client.on('reconnecting', () => {
      console.log('Reconnecting to Redis database...');
    });
  }

  async insertData(){
    const [key, value] = arguments;
    return await this.client.set(key, value);
  }
  async findData() {
    const [key] = arguments;
    return await this.client.get(key);
  }
  async updateData() {
    const [key, value] = arguments;
    return await this.client.set(key, value);
  }
  async deleteData() {
    const [key] = arguments;
    return await this.client.del(key);
  }
}

module.exports = RedisDatabase;