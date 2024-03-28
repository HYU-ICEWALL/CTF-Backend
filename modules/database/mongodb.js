require('dotenv').config();

const Database = require('./database');
const mongoose = require('mongoose');

const url = process.env.MONGO_URL;

class Mongoose extends Database {
  constructor(name, schema) {
    super(name);
    this.schema = schema;
  }
  
  async connect(){
    
    this.client = mongoose;
    console.log(`Mongo database ${this.name} connected...`);
    this.client.connect(url).catch(err => {
      console.log('Failed to connect to Mongo database...');
      console.error(err);
    });
  
    this.client.connection.on("error", err => {
      console.log('Failed to connect to Mongo database...');
      console.error(err);
    });  

    this.client.model(this.name, this.schema);
  }

  keyToObj(key){
    const query = {};
    query[Object.keys({ key })[0]] = key;
    return query;
  }

  async insertData(key, value) {
    return await this.model.create(value);
  }
  async findData(key) {
    return await this.model.find(this.keyToObj(key));
  }
  async updateData(key, value) {
    return await this.model.updateOne(this.keyToObj(key), value);
  }
  async deleteData(key) {
    return await this.model.deleteOne(this.keyToObj(key));
  }
}

module.exports = Mongoose;