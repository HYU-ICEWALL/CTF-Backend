const { APIError, APIResponse } = require('../response');

class ProblemManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createProblem({name: name, description: description, file: source, flag: flag, url: url, port: port, score: score, domain: domain}, test=false) {
    try {
      const problem = {
        name: name,
        description: description,
        file: source,
        flag: flag,
        url: url,
        port: port,
        score: score,
        domain: domain,

        test: test,

      }

      const result = await this.database.insertData(this.modelName, problem);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(300, 'Failed to create problem : ' + name);
    }
  }

  async findProblems(key){
    try {
      const result = await this.database.findData(this.modelName, key);
      if(result instanceof APIResponse)
      {
        for(let i = 0; i < result.data.length; i++){
          delete result.data[i].flag;
        }
      }
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(310, 'Failed to find problem : ', key);
    }
  }

  async deleteProblems(key){
    try {
      const result = await this.database.deleteData(this.modelName, key);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(320, 'Failed to delete problem : ' + key);
    }
  }

  async updateProblem({name: name, desc: desc, src: src, flag: flag, url: url, port: port, score: score, category: category, contest: contest}){
    try {
      const change = {}
      if(desc) change.description = desc;
      if(src) change.source = src;
      if(flag) change.flag = flag;
      if(url) change.url = url;
      if(port) change.port = port;
      if(score) change.score = score;
      if(category) change.category = category;
      if(contest) change.contest = contest;

      const result = await this.database.updateData(this.modelName, {name: name}, change);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(330, 'Failed to update problem : ' + name);
    }
  }
}

module.exports = ProblemManager;