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
      return new APIError(2100, 'Failed to create contest');
    }
  }

  async findContests(key){
    try {
      const result = await this.database.findData(this.modelName, key);
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(2110, 'Failed to find contest : ', key);
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
      return new APIError(2120, 'Failed to delete contest : ' + key);
    }
  }

  async updateContest({name: name, begin_at: begin_at, end_at: end_at, duration: duration, problems: problems, participants: participants, state: state, c_id: c_id}){
    try {
      const change = {}
      if(name) change.name = name;
      if(begin_at) change.begin_at = begin_at;
      if(end_at) change.end_at = end_at;
      // if(duration) change.duration = duration;
      if(problems) change.problems = problems;
      if(participants) change.participants = participants;
      if(state) change.state = state;

      const result = await this.database.updateData(this.modelName, {_id: c_id}, change);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2130, 'Failed to update contest : ' + name);
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
      return new APIError(2140, 'Failed to update problems in contest : ' + name);
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
      return new APIError(2150, 'Failed to update participants : ' + name);
    }
  }

  async addProblem({name: name, problem: problem}){
    try {
      const update = await this.database.updateData(this.modelName, {name: name}, {$push: {problems: problem}});
      if(update instanceof APIError){
        return update;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2160, 'Failed to add problem : ' + name);
    }
  }

  async deleteProblem({name: name, problem: problem}){
    try {
      const update = await this.database.updateData(this.modelName, {name: name}, {$pull: {problems: problem}});
      if(update instanceof APIError){
        return update;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2170, 'Failed to delete problem : ' + name);
    }
  }
}

module.exports = ContestManager;