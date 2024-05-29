const { APIError, APIResponse } = require('../response');

class ScoreboardManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createScoreboard({contest: contest, begin_at: begin_at, end_at: end_at, duration: duration}, test = false) {
    try {
      const scoreboard = {
        contest: contest,
        begin_at: begin_at,
        end_at: end_at,
        duration: duration,
        submissions: [],
        test: test,
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

  async findScoreboards(key) {
    try {
      const result = await this.database.findData(this.modelName, key);
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(510, 'Failed to find scoreboard : ' + key);
    }
  }

  async deleteScoreboards(key) {
    try {
      const result = await this.database.deleteData(this.modelName, key);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(520, 'Failed to delete scoreboard : ' + key);
    }
  }

  async updateScoreboard({contest: contest, begin_at: begin_at, duration: duration, submissions: submissions}) {
    try {
      const change = {};
      if(begin_at) change.begin_at = begin_at;
      if(duration) change.duration = duration;
      if(submissions) change.submissions = submissions;
      
      const result = await this.database.updateData(this.modelName, { contest: contest }, change);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(530, 'Failed to update scoreboard : ' + contest);
    }
  }

  async addSubmission({contest: contest, submission: submission}) {
    try {
      const scoreboardResult = await this.findScoreboards({contest: contest});
      if (scoreboardResult instanceof APIError) {
        return scoreboardResult;
      }

      const scoreboard = scoreboardResult.data[0];
      const accountId = submission.account;
      const problemId = submission.problem;

      for(let i = 0; i < scoreboard.submissions.length; i++){
        if(scoreboard.submissions[i].account == accountId && scoreboard.submissions[i].problem == problemId){
          if(scoreboard.submissions[i].type == 1){
            return new APIResponse(0, {});
          }
        }
      }

      scoreboard.submissions.push(submission);


      const result = await this.database.updateData(this.modelName, { contest: contest }, { $push: { submissions: submission } });
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(540, 'Failed to add submission : ' + submission);
    }
  }

  async findProcessedScoreboard({contest: contest}){
    const result = await this.findScoreboards({contest: contest});
    if (result.data.length === 0) {
      return new APIError(511, 'Scoreboard not found : ' + key);
    } else if (result.data.length > 1) {
      return new APIError(512, 'Scoreboard is duplicated : ' + key);
    }    
    const { submissions } = result.data[0];
    result.data.submissions = this.processSubmissions(submissions);
    return result;
  }

  processSubmissions(submissions){
    const processed = {};
    for (let i = 0; i < submissions.length; i++) {
      if(submissions[i].type == 0) continue;
      const accountId = submissions[i].account;
      if (processed[accountId] == undefined) {
        processed[accountId] = {
          total: 0,
          timestamps: []
        };
      }
      processed[accountId].total += submissions[i].score;
      processed[accountId].timestamps.push({
        problem: submissions[i].problem,
        timestamp: submissions[i].timestamp,
        score: processed[accountId].total,
        type: submissions[i].type,
      });
    }
    return processed;
  }
}

module.exports = ScoreboardManager;