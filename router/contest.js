const express = require('express');
const { contestManager, scoreboardManager, accountManager, problemManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/recent", async (req, res) => {
  try{
    const { count } = req.query;
    if(count == 0){
      res.status(200).json(new APIError(800, "Invalid parameters"));
      return;
    }

    const contestResult = await contestManager.findContests({});
    if (contestResult instanceof APIError) {
      res.status(200).json(contestResult);
      return;
    }

    // find recent contest
    const contests = contestResult.data;
    const data = {
      recent : undefined,
      upcoming : undefined,
      inProgress : undefined,
      ended : undefined,
    };

    for(let i = 0; i < contests.length; i++){
      const contest = contests[i];
      const begin_at = new Date(contest.begin_at);
      const end_at = new Date(contest.end_at);
      const now = new Date();

      if (begin_at > now){
        data.upcoming.push(contest);
      } else if (end_at < now){
        data.ended.push(contest);
      } else {
        data.inProgress.push(contest);
      }
    }

    data.recent = data.inProgress[0];
    if(!!count){
      data.upcoming = data.upcoming.slice(0, count);
      data.inProgress = data.inProgress.slice(0, count);
      data.ended = data.ended.slice(0, count);
    }

    res.status(200).json(contestResult);
  }catch(err){
    console.error(err);
    res.status(200).json(new APIError(800, "Recent contest find failed"));
  }
});

router.get("/", async (req, res) => {
  try {
    // check parameters
    const { name, problems = false, scoreboards = false } = req.query;
    if (keyword == undefined) {
      res.status(200).json(new APIError(800, "Invalid parameters"));
      return;
    }
    
    const query = {};
    if (name) query.name = name;

    if (Object.keys(query).length === 0 && (problems || scoreboards)) {
      res.status(200).json(new APIError(800, "Invalid parameters"));
      return;
    }

    // find contests
    const result = await contestManager.findContests(query);
    
    if (result instanceof APIError) {
      res.status(200).json(result);
      return;
    }
    if (!problems && !scoreboards){
      res.status(200).json(result);
      return;
    }
    const contests = result.data.map(async contest => {
      const temp = {
        contest: contest,
      };
      // find problems in contest problems
      if (problems){
        const problems = await problemManager.findProblems({contest: contest._id});
        if (problems instanceof APIError) {
          temp.problems = undefined;
        } else {
          temp.problems = problems.data;
        }
      }
      // find scoreboard in contest
      if (scoreboards){
        const scoreboard = await scoreboardManager.findScoreboards({contest: contest._id});
        if (scoreboard instanceof APIError) {
          temp.scoreboard = undefined;
        } else {
          temp.scoreboard = scoreboard.data;
        }
      }
      return temp;
    });
    result.data = contests;

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(821, "Contest find failed"));
  }
});

router.get('/scoreboard', async (req, res) => {
  try {
    // check parameters
    const { contest } = req.query;
    if (contest == undefined) {
      res.status(200).json(new APIResponse(800, 'Invalid parameters'));
      return;
    }

    // find contest
    const contestResult = await contestManager.findContests({ name : contest });
    if (contestResult instanceof APIError) {
      res.status(200).json(contestResult);
      return;
    }

    if (contestResult.data.length != 1){
      res.status(200).json(new APIError(822, 'Contest not found'));
      return;
    }

    // find scoreboard with contest object id
    const result = await scoreboardManager.findProcessedScoreboard({ contest: contestResult.data[0]._id });
    if (result instanceof APIError) {
      res.status(200).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(825, 'Failed to find scoreboard'));
  }
});

module.exports = router;