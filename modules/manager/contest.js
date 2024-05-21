const {APIError, APIResponse} = require('../response');

class ContestManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }

  async createContest({id: id, name: name, description: description, begin_at: begin_at, end_at: end_at, duration: duration, problems: problems, participants: participants}){
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
        end_at: end_at,
        duration: duration,
        problems: problems,
        participants: participants
      }

      const result = await this.database.insertData(this.modelName, contest);
      if (result instanceof APIError) {
        return result;
      }
      return new APIResponse(0, {});
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

  async deleteContests(key){
    try {
      const result = await this.database.deleteData(this.modelName, key);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(220, 'Failed to delete contest : ' + key);
    }
  }

  async updateContest({id: id, name: name, begin_at: begin_at, duration: duration, problems: problems, participants: participants}){
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
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(230, 'Failed to update contest : ' + id);
    }
  }

  async updateProblems({id: id, problems: problems}){
    try {
      const result = await this.database.updateData(this.modelName, {id: id}, {problems: problems});
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(240, 'Failed to update problems : ' + id);
    }
  }

  async updateParticipants({id: id, participants: participants}){
    try {
      const result = await this.database.updateData(this.modelName, {id: id}, {participants: participants});
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(250, 'Failed to update participants : ' + id);
    }
  }
}

module.exports = ContestManager;