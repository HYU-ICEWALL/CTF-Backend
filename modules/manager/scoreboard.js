const { APIError, APIResponse } = require('../response');

class ScoreboardManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createScoreboard({contest: contest, begin_at: begin_at, duration: duration}) {
    try {
      const scoreboard = {
        contest: contest,
        begin_at: begin_at,
        duration: duration,
        solved: [],
      };

      const result = await this.database.insertData(this.modelName, scoreboard);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(500, 'Failed to create scoreboard : ' + contest);
    }
  }

  async findScoreboard(key) {
    try {
      const result = await this.database.findData(this.modelName, key);
      if (result instanceof APIError) {
        return result;
      }

      const scoreboards = result.data;
      if (scoreboards.length === 0) {
        return new APIError(511, 'Scoreboard not found : ' + key);
      } else if (scoreboards.length > 1) {
        return new APIError(512, 'Scoreboard is duplicated : ' + key);
      }

      return new APIResponse(0, scoreboards[0]);
    } catch (error) {
      console.error(error);
      return new APIError(510, 'Failed to find scoreboard : ' + key);
    }
  }

  async deleteScoreboard({id: id}) {
    try {
      const result = await this.database.deleteData(this.modelName, { contest: id });
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(520, 'Failed to delete scoreboard : ' + id);
    }
  }

  async updateScoreboard({id: id, begin_at: begin_at, duration: duration, solved: solved}) {
    try {
      const change = {};
      if(begin_at) change.begin_at = begin_at;
      if(duration) change.duration = duration;
      if(solved) change.solved = solved;
      
      const result = await this.database.updateData(this.modelName, { contest: id }, change);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(530, 'Failed to update scoreboard : ' + id);
    }
  }

  async addSolved({id: id, solved: solved}) {
    try {
      // $push
      const result = await this.database.updateData(this.modelName, { contest: id }, { $push: { solved: solved } });
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(540, 'Failed to add solved : ' + id);
    }
  }

  async findProcessedScoreboard({id: id}){
    const result = await this.findScoreboard(id);
    const { solved } = result.data;

    const processed = {};
    for(let i = 0; i < solved.length; i++){
      const accountId = solved[i].account;
      if(processed[accountId] == undefined){
        processed[accountId] = {
          total: 0,
          timestamps: []
        };
      }
      processed[accountId].total += solved[i].score;
      processed[accountId].timestamps.push({
        problem: solved[i].problem,
        timestamp: solved[i].timestamp,
        score: processed[accountId].total,
      });
    }

    result.data.solved = processed;
    return result;
  }
}

module.exports = ScoreboardManager;