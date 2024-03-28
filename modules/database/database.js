class Database{
  constructor(databaseName){
    this.name = databaseName;
  };

  async insertData(key, value){}
  async findData(key){}
  async updateData(key, value){}
  async deleteData(key){}
}

module.exports = Database