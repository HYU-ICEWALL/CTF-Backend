const {APIError, APIResponse} = require('../response');

class ContestManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }

  async createContest(id, name, description, begin_at, duration, problems, participants){
    try {
      if(problems === undefined){
        problems = [];
      }
      if(participants === undefined){
        participants = [];
      }

      const contest = {
        id: id,
        name: name,
        description: description,
        begin_at: begin_at,
        duration: duration,
        problems: problems,
        participants: participants
      }

      const result = await this.database.insertData(this.modelName, contest);
      if (result instanceof APIError) {
        return result;
      }
      return new APIResponse(0, {id: id});
    } catch (error) {
      console.error(error);
      return new APIError(200, 'Failed to create contest : ' + id);
    }
  }

  async findContests(key){
    try {
      const result = await this.database.findData(this.modelName, key);
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(210, 'Failed to find contest : ', key);
    }
  }

  async deleteContest(id){
    try {
      const result = await this.database.deleteData(this.modelName, {id: id});
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {id: id});
    } catch (error) {
      console.error(error);
      return new APIError(220, 'Failed to delete contest : ' + id);
    }
  }

  async updateContest(id, name, begin_at, duration, problems, participants){
    try {
      const change = {}
      if(name) change.name = name;
      if(begin_at) change.begin_at = begin_at;
      if(duration) change.duration = duration;
      if(problems) change.problems = problems;
      if(participants) change.participants = participants;

      const result = await this.database.updateData(this.modelName, {id: id}, change);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {id: id});
    } catch (error) {
      console.error(error);
      return new APIError(230, 'Failed to update contest : ' + id);
    }
  }
}

module.exports = ContestManager;