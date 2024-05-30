const { APIResponse, APIError } = require('../response');
const Database = require('./database');
const mongoose = require('mongoose');

class Mongoose extends Database {
  constructor(name, schemas, url) {
    super(name);
    this.schemas = schemas;
    this.url = url + '/' + name;
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
    Object.keys(this.schemas).map((key, index) => {
      this.model[key] = this.client.model(key, this.schemas[key]);
    });
  }
  
  async insertData() {
    try{
      const [model, value] = arguments;
      const result = await this.model[model].create(value);
      return new APIResponse(0, result);
    }catch(err){
      console.error(err);
      return new APIError(700, 'Failed to insert data');
    }
  }

  async findData() {
    try {
      const [model, key] = arguments;
      const result = await this.model[model].find(key);
      return new APIResponse(0, result);
    } catch (err) {
      console.error(err);
      return new APIError(710, 'Failed to find data');
    }
  }

  async updateData() {
    try {
      const [model, key, value] = arguments;
      // console.log(value);
      const result = await this.model[model].updateMany(key, value);
      if (result.matchedCount == 0){
        return new APIError(721, 'No matched data to update');
      }

      return new APIResponse(0, result);
    } catch (err) {
      console.error(err);
      return new APIError(720, 'Failed to update data');
    }
  }
  
  async deleteData() {
    try {
      const [model, key] = arguments;
      const result = await this.model[model].deleteMany(key);
      return new APIResponse(0, result);
    } catch (err) {
      console.error(err);
      return new APIError(730, 'Failed to delete data');
    }
  }
}

module.exports = Mongoose;