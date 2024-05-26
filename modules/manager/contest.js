const {APIError, APIResponse} = require('../response');

class ContestManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }

  async createContest({name: name, description: description, begin_at: begin_at, end_at: end_at, duration: duration, problems: problems, participants: participants}, test=false){
    try {
      if(problems === undefined){
        problems = [];
      }
      if(participants === undefined){
        participants = [];
      }

      const contest = {
        name: name,
        description: description,
        begin_at: begin_at,
        end_at: end_at,
        duration: duration,
        problems: problems,
        participants: participants,
        state: '0',
        test: test,
      }

      const result = await this.database.insertData(this.modelName, contest);
      if (result instanceof APIError) {
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(200, 'Failed to create contest');
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

  async updateContest({name: name, begin_at: begin_at, end_at: end_at, duration: duration, problems: problems, participants: participants, state: state}){
    try {
      const change = {}
      if(begin_at) change.begin_at = begin_at;
      if(end_at) change.end_at = end_at;
      if(duration) change.duration = duration;
      if(problems) change.problems = problems;
      if(participants) change.participants = participants;
      if(state) change.state = state;

      const result = await this.database.updateData(this.modelName, {name: name}, change);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(230, 'Failed to update contest : ' + name);
    }
  }

  async updateProblems({name: name, problems: problems}){
    try {
      const result = await this.database.updateData(this.modelName, {name: name}, {problems: problems});
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(240, 'Failed to update problems : ' + name);
    }
  }

  async updateParticipants({name: name, participants: participants}){
    try {
      const result = await this.database.updateData(this.modelName, {name: name}, {participants: participants});
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(250, 'Failed to update participants : ' + name);
    }
  }
}

module.exports = ContestManager;