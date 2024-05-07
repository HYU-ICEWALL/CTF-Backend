const express = require('express');
const { contestManager, scoreboardManager, accountManager } = require('../instances');
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

router.get("/", async (req, res) => {
  try {
    const { id, name } = req.query;
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

    const result = await contestManager.findContests(query);
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
    const { id } = req.query;
    if (id == undefined) {
      res.status(200).json(new APIResponse(800, 'Invalid parameters'));
      return;
    }
    const result = await scoreboardManager.findScoreboard({ contest: id });
    if (result instanceof APIError) {
      res.status(200).json(result);
      return;
    }

    // TODO : sort by score
    const { solved } = result.data;
    const scoreboards = {};
    for(let i = 0; i < solved.length; i++){
      const score = solved[i];

      const accountId = score.account;
      if (!scoreboards[accountId]){
        scoreboards[accountId] = [];
      } 

      scoreboards[accountId].push({
        score: score.score,
        time: score.time,
      });
    }

    Object.keys(scoreboards).forEach((key) => {
      // sort by time asc
      scoreboards[key].sort((a, b) => {
        return a.time - b.time;
      });
    });
    result.data.solved = scoreboards;
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