const fs = require('fs');

class LocalStorage{
  constructor(name, path){
    super(name);
    this.path = path;
  }

  async connect(){
    try{
      if(!fs.existsSync(this.path)){
        fs.mkdirSync(this.path);
      }
      console.log(`Local storage ${this.name} connected...`);
      return true;
    }catch(err){
      console.error(err);
      console.log('Failed to connect to local storage...');
      return false;
    }
  }

  async insertData() {
    try{
      const [value] = arguments;
      

    }catch(err){
      console.error(err);
      return new APIError(700, 'Failed to insert data');
    }
  }
}