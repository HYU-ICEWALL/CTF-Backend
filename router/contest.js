const express = require('express');
const { contestManager, scoreboardManager, accountManager, problemManager, sessionManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/recent", async (req, res) => {
  try{
    console.log("Find contests");
    const contestResult = await contestManager.findContests({});
    if (contestResult instanceof APIError) {
      res.status(200).json(contestResult);
      return;
    }

    // find recent contest
    console.log("Sort contest");
    const contests = contestResult.data.sort((a, b) => {
      return new Date(b.begin_at) - new Date(a.begin_at);
    });

    const data = {
      recent: null,
      upcoming: [],
      inProgress: [],
      ended: []
    }    

    for(let i = 0; i < contests.length; i++){
      const contest = contests[i];
      const begin_at = new Date(contest.begin_at);
      const end_at = new Date(contest.end_at);
      const now = new Date();
      
      if(now < begin_at){
        data.upcoming.push(contest.name);
      }else if(now >= begin_at && now <= end_at){
        data.inProgress.push(contest.name);
      }else if(now > end_at){
        data.ended.push(contest.name);
      }
    }
    
    console.log("Find recent contest");
    if(data.inProgress.length > 0){
      data.recent = data.inProgress[0];
    }else if(data.ended.length > 0){
      data.recent = data.ended[0];
    }else if(data.upcoming.length > 0){
      data.recent = data.upcoming[0];
    }else{
      data.recent = null;
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
    const { name, problems, scoreboard } = req.query;
    const query = {};
    if(name) query.name = name;
    console.log("Find contests");
    const result = await contestManager.findContests(query);
    if(!name || (!!name && !problems && !scoreboard)){
      delete result.data[0].problems;
      delete result.data[0].participants;
      return res.status(200).json(result);
    }

    const sessionResult = await sessionManager.checkValidSession(req.session);

    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    if(result.data.length != 1){
      return res.status(200).json(new APIError(820, "Contest not found"));
    }

    const contest = {
      ...result.data[0]
    };

    console.log(contest);
    const data = JSON.parse(req.session.data);
    console.log("Check contest participants");
    if(!contest.participants.includes(data.id)){
      return res.status(200).json(new APIError(821, "Not in contest participants"));
    }

    console.log("Find contest problems and scoreboards");
    if(problems){
      const problemResult = await problemManager.findProblems({ contest: contest.name });
      if(problemResult instanceof APIError){
        return res.status(200).json(problemResult);
      }

      // return res.status(200).json(new APIResponse(0, { contest: contest, problems: problemResult.data }));
      console.log(problemResult.data);
      contest.problems = problemResult.data;
      console.log(contest.problems);
    }

    if(scoreboard){
      const scoreboardResult = await scoreboardManager.findProcessedScoreboard({ contest: contest.name });
      if(scoreboardResult instanceof APIError){
        return res.status(200).json(scoreboardResult);
      }
      contest.scoreboard = scoreboardResult.data[0];
      console.log(contest.scoreboard);
    }
    
    console.log(contest);
    
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
      name: name,
    });

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
    const data = JSON.parse(req.session.data);
    if(!contest.participants.includes(data.id)){
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