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
      return new APIError(2200, 'Failed to create problem : ' + name);
    }
  }

  // async getProblems(){
  //   try{
  //     const result = await this.database.getList(this.modelName);

  //     if(result instanceof APIError) return result;

  //   }catch(err){
  //     console.error(err);
  //     return new APIError(340, 'Failed to get problem list');
  //   }
  // }

  async findProblems(key, flag=true, contest=false){
    try {
      if(contest) key.contest = { $exists: true };

      const result = await this.database.findData(this.modelName, key);

      if(result instanceof APIError){
        return result;
      }

      if(!flag){
        for(let i = 0; i < result.data.length; i++){
          result.data[i].flag = undefined;
        }
      }

      return result;
    } catch (error) {
      console.error(error);
      return new APIError(2210, 'Failed to find problem : ', key);
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
      return new APIError(2220, 'Failed to delete problem : ' + key);
    }
  }

  async updateProblem({name: name, description: description, src: src, flag: flag, url: url, port: port, score: score, domain: domain, contest: contest, p_id: p_id}){
    try {
      const change = {}
      if(name) change.name = name;
      if(description) change.description = description;
      if(src) change.file = src;
      if(flag) change.flag = flag;
      if(url) change.url = url;
      if(port) change.port = port;
      if(score) change.score = score;
      if(domain) change.domain = domain;
      if(contest) change.contest = contest;

      console.log(change);

      const result = await this.database.updateData(this.modelName, {_id: p_id}, change);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2230, 'Failed to update problem : ' + name);
    }
  }
}

module.exports = ProblemManager;