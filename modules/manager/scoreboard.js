const { APIError, APIResponse } = require('../response');

class ScoreboardManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createScoreboard({contest: contest, begin_at: begin_at, end_at: end_at}, test = false) {
    try {
      const scoreboard = {
        contest: contest,
        begin_at: begin_at,
        end_at: end_at,
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
      return new APIError(2400, 'Failed to create scoreboard : ' + contest);
    }
  }

  async findScoreboards(key) {
    try {
      const result = await this.database.findData(this.modelName, key);
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(2410, 'Failed to find scoreboard : ' + key);
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
      return new APIError(2420, 'Failed to delete scoreboard : ' + key);
    }
  }

  async updateScoreboard({contest: contest, begin_at: begin_at, submissions: submissions}) {
    try {
      const change = {};
      if(begin_at) change.begin_at = begin_at;
      if(submissions) change.submissions = submissions;
      
      const result = await this.database.updateData(this.modelName, { contest: contest }, change);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2430, 'Failed to update scoreboard : ' + contest);
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
      return new APIError(2440, 'Failed to update submissions in scoreboard : ' + submission);
    }
  }

  async findProcessedScoreboard({contest: contest}){
    try{
      const result = await this.findScoreboards({contest: contest});
      if (result instanceof APIError) {
        return result;
      }
      if (result.data.length != 1) {
        return new APIError(2451, 'Scoreboard not found : ' + contest);
      }
      const processed = this.processSubmissions(result.data[0].submissions);
      result.data[0].submissions = processed;
      result.data = result.data[0];
      return result;
    }catch(error){
      console.error(error);
      return new APIError(2450, 'Failed to find processed scoreboard : ' + contest);
    }
  }

  processSubmissions(submissions){
    try{
      const processedObj = {};
      for (let i = 0; i < submissions.length; i++) {
        if(submissions[i].type == 0) continue;
        const accountId = submissions[i].account;
        if (processedObj[accountId] == undefined) {
          processedObj[accountId] = {
            account: accountId,
            total: 0,
            timestamps: []
          };
        }
        processedObj[accountId].total += submissions[i].score;
        processedObj[accountId].timestamps.push({
          problem: submissions[i].problem,
          time: submissions[i].time,
          score: processedObj[accountId].total,
        });
      }
      
      const processed = [];
      for (const key in processedObj) {
        processed.push(processedObj[key]);
      }
  
      return processed;

      // let timestamps = [];
      // const processedObj = {};
      // for (let i = 0; i < submissions.length; i++) {
      //   if(submissions[i].type == 0) continue;
      //   timestamps.push(submissions[i].time);
      //   const accountId = submissions[i].account;
      //   if (processedObj[accountId] == undefined) {
      //     processedObj[accountId] = {
      //       account: accountId,
      //       total: 0,
      //       timestamps: []
      //     };
      //   }
      // }
      // timestamps = new Set(timestamps);
      // timestamps = Array.from(timestamps);
      // timestamps.sort((a, b) => a - b);


    }catch(err){
      console.error(err);
      return new APIError(2460, 'Failed to process submissions');
    }
  }

  async getRanking({contest: contest}){
    try{
      const scoreboardResult = await this.findProcessedScoreboard({contest: contest});
      if (scoreboardResult instanceof APIError) {
        return scoreboardResult;
      }
      const processed = scoreboardResult.data;
      console.log(processed);
      const ranking = processed.submissions.sort((a, b) => {
        if (a.total == b.total) {
          return a.timestamps[a.timestamps.length - 1].time - b.timestamps[b.timestamps.length - 1].time;
        }
        return b.total - a.total;
      });

      const result = ranking.map((account, index) => {
        return {
          rank : index + 1,
          account : account.account,
          total : account.total,
        }
      });

      return new APIResponse(0, result);
    }catch(error){
      console.error(error);
      return new APIError(2470, 'Failed to get ranking : ' + contest);
    } 
  }
}

module.exports = ScoreboardManager;