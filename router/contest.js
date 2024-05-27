const express = require('express');
const { contestManager, scoreboardManager, accountManager, problemManager, sessionManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/recent", async (req, res) => {
  try{
    const { count } = req.query;
    if(count <= 0){
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
      recent : [],
      upcoming : [],
      inProgress : [],
      ended : [],
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

    contestResult.data = data;

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
    
    const query = {};
    if(name) query.name = name;
    const result = await contestManager.findContests(query);
    if(!name || (!!name && !problems && !scoreboards)){
      return res.status(200).json(result);
    }

    const sessionResult = await sessionManager.checkValidSession(req.session);

    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    if(result.data.length === 0){
      return res.status(200).json(new APIError(820, "Contest not found"));
    }

    const contest = result.data[0];
    if(contest.participants.includes(req.session.data.id) === false){
      return res.status(200).json(new APIError(821, "Not in contest participants"));
    }

    if(problems){
      const problemResult = await problemManager.findProblems({ contest: contest.name });
      if(problemResult instanceof APIError){
        return res.status(200).json(problemResult);
      }
      contest.problems = problemResult.data;
    }

    if(scoreboards){
      const scoreboardResult = await scoreboardManager.findProcessedScoreboard({ contest: contest.name });
      if(scoreboardResult instanceof APIError){
        return res.status(200).json(scoreboardResult);
      }
      contest.scoreboards = scoreboardResult.data;
    }
    
    return res.status(200).json(new APIResponse(0, contest));
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(821, "Contest find failed"));
  }
});

router.get('/scoreboard', async (req, res) => {
  try {
    // check parameters
    const { name } = req.query;
    if (!name) {
      res.status(200).json(new APIResponse(800, 'Invalid parameters'));
      return;
    }

    // find contest
    const contestResult = await contestManager.findContests({
    });

    console.log(contestResult.data);

    if (contestResult instanceof APIError) {
      res.status(200).json(contestResult);
      return;
    }

    if (contestResult.data.length != 1){
      res.status(200).json(new APIError(822, 'Contest not found'));
      return;
    }

    const sessionResult = await sessionManager.checkValidSession(req.session);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    const contest = contestResult.data[0];
    if(contest.participants.includes(req.session.data.id)){
      return res.status(200).json(new APIError(823, "Not in contest participants"));
    }

    const scoreboardResult = await scoreboardManager.findProcessedScoreboard({ contest: contest.name });
    res.status(200).json(scoreboardResult);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(825, 'Failed to find scoreboard'));
  }
});

module.exports = router;