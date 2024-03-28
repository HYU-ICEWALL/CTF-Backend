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

    Object.keys(this.schemaObj).map((value, index) => {
      this.client.model(value, this.schemaObj[value]);
    });
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