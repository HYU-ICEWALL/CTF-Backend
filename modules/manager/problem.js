const { APIError, APIResponse } = require('../response');

class ProblemManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createProblem(id, name, desc, src, flag, link, score, category, contest) {
    try {
      const problem = {
        id: id,
        name: name,
        description: desc,
        source: src,
        flag: flag,
        link: link,
        score: score,
        category: category,
        contest: contest,
      }

      const result = await this.database.insertData(this.modelName, problem);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, { id: id });
    } catch (error) {
      console.error(error);
      return new APIError(300, 'Failed to create problem : ' + id);
    }
  }

  async findProblems(key){
    try {
      const result = await this.database.findData(this.modelName, key);
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(310, 'Failed to find problem : ', key);
    }
  }

  async deleteProblem(id){
    try {
      const result = await this.database.deleteData(this.modelName, {id: id});
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {id: id});
    } catch (error) {
      console.error(error);
      return new APIError(320, 'Failed to delete problem : ' + id);
    }
  }

  async updateProblem(id, name, desc, src, flag, link, score, category, contest){
    try {
      const change = {}
      if(name) change.name = name;
      if(desc) change.description = desc;
      if(src) change.source = src;
      if(flag) change.flag = flag;
      if(link) change.link = link;
      if(score) change.score = score;
      if(category) change.category = category;
      if(contest) change.contest = contest;


      const result = await this.database.updateData(this.modelName, {id: id}, problem);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {id: id});
    } catch (error) {
      console.error(error);
      return new APIError(330, 'Failed to update problem : ' + id);
    }
  }
}

module.exports = ProblemManager;