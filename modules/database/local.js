const Database = require("./database");
const fs = require('fs');

class LocalDatabase extends Database {
  constructor(name, path) {
    super(name);
    this.path = path;
  }

  async connect() {
    try {
      console.log('Connecting to local database ' + this.name + '...');
      if (fs.existsSync(this.path)) {
        console.log('Local database ' + this.name + ' exists...');
      } else {
        throw new Error('Local database ' + this.name + ' does not exist...');
      }
    } catch (error) {
      console.error('Failed to connect to local database ' + this.name + '...');
      console.error(error);
    }
  }

  async load() {
    try {
      const data = fs.readFileSync(this.path, 'utf8');
      this.data = JSON.parse(data.toString());
      console.log('Local database ' + this.name + ' loaded...');
    } catch (error) {
      console.error('Failed to load local database ' + this.name + '...');
      console.error(error);
    }
  }

  async save() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.data));
      console.log('Local database ' + this.name + ' saved...');
    } catch (error) {
      console.error('Failed to save local database ' + this.name + '...');
      console.error(error);
    }
  }

  insertData(key, value) {
    if (!!this.data[key]) return;
    this.data[key] = value;
    this.save();
  }

  findData(key) {
    return this.data[key];
  }

  updateData(key, value) {
    if (!this.data[key]) return;
    this.data[key] = value;

    this.save();
  }

  deleteData(key) {
    delete this.data[key];
  }
}

module.exports = LocalDatabase;