class Database{
  constructor(name){
    this.name = name;
  };

  async insertData(key, value){}
  async findData(key){}
  async updateData(key, value){}
  async deleteData(key){}
}


module.exports = Database