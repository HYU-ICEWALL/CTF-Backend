const express = require('express');
const { problemManager, scoreboardManager, contestManager, profileManager, sessionManager, timeManager } = require('../instances');
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
    const problemResult = await problemManager.findProblems(query, false, true);

    res.status(200).json(problemResult);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(300, "Problem find failed"));
  }
});

router.post('/submit', async (req, res) => {
  try{
    // session check
    const sessionResult = await sessionManager.checkValidSession(req);

    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }
    
    const data = JSON.parse(req.session.data);
    
    // parameter check
    const { name, flag } = req.body;
    if (name == undefined || flag == undefined) {
      res.status(200).json(new APIError(311, "Invalid parameters"));
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
      res.status(200).json(new APIError(312, "Problem not found"));
      return;
    }

    console.log("Add solved problem in profile");
    const flagResult = (problemResult.data[0].flag == flag);
    // add problem id in profile if solved
    if(flagResult){
      const profileResult = await profileManager.addSolved({ id: data.id, solved: name });
  
      if (profileResult instanceof APIError) {
        res.status(200).json(profileResult);
        return;
      }
    }  

    console.log("Find contest");
    // find contest from problem
    const contestName = problemResult.data[0].contest;

    // find contest
    const contestResult = await contestManager.findContests({
      name: contestName
    });

    if (contestResult instanceof APIError) {
      res.status(200).json(contestResult);
      return;
    }

    // check contest length 1
    if (contestResult.data.length != 1) {
      res.status(200).json(new APIError(313, "Contest not found"));
      return;
    }

    console.log("Check contest participants");

    // find participant in contest
    if (!contestResult.data[0].participants.includes(data.id)) {
      console.log("Not in contest participants : " + data.id);
      res.status(200).json(new APIResponse(0, { result: flagResult }));
      return;
    }

    // check contest time
    // YYYY-MM-DD HH:MM:SS
    const time = timeManager.timestamp();
    const begin = contestResult.data[0].begin_at;
    const end = contestResult.data[0].end_at;

    if (time < begin || time > end) {
      console.log("Not in contest time : " + time);
      res.status(200).json(new APIResponse(0, { result: flagResult }));
      return;
    }

    console.log("Add submission in scoreboard : " + (name, data.id));
    // add submission in scoreboard
    const scoreboardResult = await scoreboardManager.addSubmission({
      contest: contestName, 
      submission: {
        problem: name,
        score: problemResult.data[0].flag == flag ? problemResult.data[0].score : 0,
        account: data.id,
        type: problemResult.data[0].flag == flag ? 1 : 2,
        time: time,
      }
    });

    if (scoreboardResult instanceof APIError) {
      res.status(200).json(flagResult);
      return;
    }

    res.status(200).json(new APIResponse(0, { result: problemResult.data[0].flag == flag }));
  }catch(error){
    console.error(error);
    res.status(200).json(new APIError(310, "Problem flag check failed"));
  }
});

router.get('/file/:filename', async (req, res) => {
  const filename = `/workspace/problems/${req.params.filename}`;
  res.sendFile(filename, (err => {
    console.log(`Error at send flie: ${err}`);

    return res.send("<script>alert('file send error'); history.go(-1);</script>");
  }))
})

module.exports = router;