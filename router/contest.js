const express = require('express');
const { contestManager, scoreboardManager, accountManager, problemManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();


// admin only
// router.post("/", async (req, res) => {
//   try {
//     const sessionResult = await sessionManager.checkValidSession(req);
//     if (sessionResult instanceof APIError) {
//       res.status(200).json(sessionResult);
//       return;
//     }

//     const accountResult = await accountManager.findAccountWithId(req.session.id);
//     if (accountResult instanceof APIError) {
//       res.status(200).json(accountResult);
//       return;
//     }
//     if (accountResult.data.authority != 1) {
//       res.status(200).json(new APIError(801, 'Permission denied'));
//       return;
//     }

//     const { id, name, description, begin_at, duration, problems, participants } = req.body;
//     if (id == undefined || name == undefined || description == undefined || begin_at == undefined || duration == undefined || problems == undefined || participants == undefined) {
//       res.status(200).json(new APIError(800, "Invalid parameters"));
//       return;
//     }

//     const contest = {
//       id: id,
//       name: name,
//       description: description,
//       manager: req.session.id,
//       begin_at: begin_at,
//       duration: duration,
//       problems: problems,
//       participants: participants,
//     };

//     const result = await contestManager.createContest(contest);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(820, "Contest create failed"));
//   }
// });

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
    if (id) query.id = id;
    if (name) query.name = name;

    if (Object.keys(query).length === 0) {
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
        const problems = await problemManager.findProblems({contest: contest.id});
        if (problems instanceof APIError) {
          temp.problems = undefined;
        } else {
          temp.problems = problems.data;
        }
      }
      // find scoreboard in contest
      if (scoreboards){
        const scoreboard = await scoreboardManager.findScoreboards({contest: contest.id});
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

// admin only
// router.delete('/', async (req, res) => {
//   try {
//     if (!req.session || !req.session.token || !req.session.id) {
//       res.status(200).json(new APIError(602, 'Session not found'));
//       return;
//     }

//     if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
//       res.status(200).json(new APIError(611, 'Cookie malformed'));
//       return;
//     }

//     const accountResult = await accountManager.findAccountWithId(req.session.id);
//     if (accountResult instanceof APIError) {
//       res.status(200).json(accountResult);
//       return;
//     }
//     if (accountResult.data.authority != 1) {
//       res.status(200).json(new APIError(801, 'Permission denied'));
//       return;
//     }

//     const { id } = req.body;
//     if (id == undefined) {
//       res.status(200).json(new APIError(800, "Invalid parameters"));
//       return;
//     }

//     const result = await contestManager.deleteContest(id);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(822, "Contest delete failed"));
//   }
// });

// admin only
// router.put('/', async (req, res) => {
//   try {
//     if (!req.session || !req.session.token || !req.session.id) {
//       res.status(200).json(new APIError(602, 'Session not found'));
//       return;
//     }

//     if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
//       res.status(200).json(new APIError(611, 'Cookie malformed'));
//       return;
//     }

//     const accountResult = await accountManager.findAccountWithId(req.session.id);
//     if (accountResult instanceof APIError) {
//       res.status(200).json(accountResult);
//       return;
//     }
//     if (accountResult.data.authority != 1) {
//       res.status(200).json(new APIError(801, 'Permission denied'));
//       return;
//     }

//     const { id, name, description, manager, begin_at, duration, problems, participants } = req.body;

//     if (id == undefined) {
//       res.status(200).json(new APIError(800, "Invalid parameters"));
//       return;
//     }

//     const query = {};
//     if (name) query.name = name;
//     if (description) query.description = description;
//     if (manager) query.manager = manager;
//     if (begin_at) query.begin_at = begin_at;
//     if (duration) query.duration = duration;
//     if (problems) query.problems = problems;
//     if (participants) query.participants = participants;

//     if (Object.keys(query).length === 0) {
//       res.status(200).json(new APIError(800, "Invalid parameters"));
//       return;
//     }

//     const result = await contestManager.updateContest(id, query);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(823, "Contest update failed"));
//   }
// });


// admin only
// router.post('/scoreboard', async (req, res) => {
//   try {
//     if (!req.session || !req.session.token || !req.session.id) {
//       res.status(200).json(new APIError(602, 'Session not found'));
//       return;
//     }

//     if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
//       res.status(200).json(new APIError(611, 'Cookie malformed'));
//       return;
//     }

//     const accountResult = await accountManager.findAccountWithId(req.session.id);
//     if (accountResult instanceof APIError) {
//       res.status(200).json(accountResult);
//       return;
//     }
//     if (accountResult.data.authority != 1) {
//       res.status(200).json(new APIError(801, 'Permission denied'));
//       return;
//     }

//     const { id } = req.body;
//     if (id == undefined) {
//       res.status(200).json(new APIResponse(800, 'Invalid parameters'));
//       return;
//     }

//     const contestResult = await contestManager.findContests({ id: id });
//     if (contestResult instanceof APIError) {
//       res.status(200).json(contestResult);
//       return;
//     }

//     const contest = contestResult.data[0];
//     const result = await scoreboardManager.createScoreboard({ contest: id, begin_at: contest.begin_at, duration: contest.duration });
//     res.status(200).json(result);
//   } catch (error) { 
//     console.error(error);
//     res.status(200).json(new APIError(824, 'Failed to create scoreboard'));
//   }
// });

router.get('/scoreboard', async (req, res) => {
  try {
    // check parameters
    const { contest } = req.query;
    if (contest == undefined) {
      res.status(200).json(new APIResponse(800, 'Invalid parameters'));
      return;
    }
    // find scoreboard with contest id
    const result = await scoreboardManager.findProcessedScoreboard({ contest: contest });
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

// admin only
// router.delete('/scoreboard', async (req, res) => {
//   try{
//     if (!req.session || !req.session.token || !req.session.id) {
//       res.status(200).json(new APIError(602, 'Session not found'));
//       return;
//     }

//     if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
//       res.status(200).json(new APIError(611, 'Cookie malformed'));
//       return;
//     }

//     const accountResult = await accountManager.findAccountWithId(req.session.id);
//     if (accountResult instanceof APIError) {
//       res.status(200).json(accountResult);
//       return;
//     }
//     if (accountResult.data.authority != 1) {
//       res.status(200).json(new APIError(801, 'Permission denied'));
//       return;
//     }

//     const { id } = req.body;
//     if (id == undefined) {
//       res.status(200).json(new APIResponse(800, 'Invalid parameters'));
//       return;
//     }

//     const result = await scoreboardManager.deleteScoreboard(id);
//     res.status(200).json(result);
//   }catch(error){
//     console.error(error);
//     res.status(200).json(new APIError(826, 'Failed to delete scoreboard'));
//   }
// });

// admin only
// router.put('/scoreboard', async (req, res) => {
//   try {
//     if (!req.session || !req.session.token || !req.session.id) {
//       res.status(200).json(new APIError(602, 'Session not found'));
//       return;
//     }

//     if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
//       res.status(200).json(new APIError(611, 'Cookie malformed'));
//       return;
//     }

//     const accountResult = await accountManager.findAccountWithId(req.session.id);
//     if (accountResult instanceof APIError) {
//       res.status(200).json(accountResult);
//       return;
//     }
//     if (accountResult.data.authority != 1) {
//       res.status(200).json(new APIError(801, 'Permission denied'));
//       return;
//     }

//     const { id, begin_at, duration } = req.body;
//     if (id == undefined) {
//       res.status(200).json(new APIResponse(800, 'Invalid parameters'));
//       return;
//     }

//     const query = {};
//     if (begin_at) query.begin_at = begin_at;
//     if (duration) query.duration = duration;

//     if (Object.keys(query).length === 0) {
//       res.status(200).json(new APIResponse(800, 'Invalid parameters'));
//       return;
//     }

//     const result = await scoreboardManager.updateScoreboard(id, query);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(827, 'Failed to update scoreboard'));
//   }
// });

module.exports = router;