const Database = require('./database');
const mongoose = require('mongoose');

class Mongoose extends Database {
  constructor(name, schemaObj, url) {
    super(name);
    this.schemaObj = schemaObj;
    this.url = url;
  }
  
  async connect(){
    this.client = mongoose;
    this.client.connect(this.url).then((value) => {
      console.log(`Mongo database ${this.name} connected...`);
    })
    .catch(err => {
      console.log('Failed to connect to Mongo database...');
      console.error(err);
    });
  
    this.client.connection.on("error", err => {
      console.log('Failed to connect to Mongo database...');
      console.error(err);
    });  
    this.model = {};
    Object.keys(this.schemaObj).map((key, index) => {
      this.model[key] = this.client.model(key, this.schemaObj[key]);
    });
  }

  keyToObj(key){
    const query = {};
    query[Object.keys({ key })[0]] = key;
    return query;
  }

  async insertData() {
    const [model, value] = arguments;
    console.log(value);
    return await this.model[model].create(value);
  }
  async findData() {
    const [model, key] = arguments;
    return await this.model[model].find(key);
  }
  async updateData() {
    const [model, key, value] = arguments;
    return await this.model[model].updateOne(key, value);
  }
  async deleteData() {
    const [model, key] = arguments;
    return await this.model[model].deleteOne(key);
  }
}

module.exports = Mongoose;