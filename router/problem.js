const express = require('express');
const { problemManager, scoreboardManager, contestManager, profileManager, sessionManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // check parameters
    const { name, category, contest } = req.query;

    const query = {};
    if(name) query.name = name;
    if(category) query.category = category;
    if(contest) query.contest = contest;

    // find problems
    console.log("Find problems");
    const result = await problemManager.findProblems(query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(831, "Problem find failed"));
  }
});

router.post('/submit', async (req, res) => {
  try{
    // session check
    const sessionResult = await sessionManager.checkValidSession(req.session);

    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }
    
    // find id from session
    const id = req.session.data.id;
    
    // parameter check
    const { name, flag } = req.body;
    if (name == undefined || flag == undefined) {
      res.status(200).json(new APIError(800, "Invalid parameters"));
      return;
    }

    // find problems
    console.log("Find problems");
    const problemResult = await problemManager.findProblems({ name: name });
    if (problemResult instanceof APIError) {
      res.status(200).json(problemResult);
      return;
    }


    // check problem length 1
    if (problemResult.data.length != 1) {
      res.status(200).json(new APIError(833, "Problem not found"));
      return;
    }

    console.log("Find contest");
    // find contest from problem
    const contestName = problemResult.data[0].contest;

    console.log(contestName);

    // find contest
    const contestResult = await contestManager.findContests({
      name: contestName
    });

    if (contestResult instanceof APIError) {
      res.status(200).json(contestResult);
      return;
    }

    console.log(contestResult);
    // check contest length 1
    if (contestResult.data.length != 1) {
      res.status(200).json(new APIError(834, "Contest not found"));
      return;
    }

    console.log("Check contest participants");

    // find participant in contest
    if(contestResult.data[0].participants.includes(id) == false){
      res.status(200).json(new APIError(835, "Not in contest participants"));
      return;
    }
    
    // check contest time
    // YYYY-MM-DD HH:MM:SS
    const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const begin = contestResult.data[0].begin_at;
    const end = contestResult.data[0].end_at;

    // if (time < begin || time > end) {
    //   res.status(200).json(new APIError(836, "Contest is not in progress"));
    //   return;
    // }

    // add problem id in profile if solved
    if(problemResult.data[0].flag == flag){
      const profileResult = await profileManager.addSolved({ id: req.session.data.id, solved: {
        problem: problem,
        score: problemResult.data[0].score,
        account: req.session.data.id,
        time: time,
      }});
  
      if (profileResult instanceof APIError) {
        res.status(200).json(profileResult);
        return;
      }
    }

    // add submission in scoreboard
    const result = await scoreboardManager.addSubmission({
      contest: contestName, 
      submission: {
        problem: problem,
        score: problemResult.data[0].score,
        account: req.session.data.id,
        type: problemResult.data[0].flag == flag ? 1 : 2,
        time: time,
      }
    });

    if (result instanceof APIError) {
      res.status(200).json(result);
      return;
    }

    res.status(200).json(new APIResponse(0, { result: problemResult.data[0].flag == flag }));
  }catch(error){
    console.error(error);
    res.status(200).json(new APIError(837, "Problem flag check failed"));
  }
});

module.exports = router;