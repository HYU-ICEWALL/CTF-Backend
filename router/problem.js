const express = require('express');
const { problemManager, scoreboardManager, contestManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id, name, category, contest } = req.query;
    
    const query = {};
    if(id) query.id = id;
    if(name) query.name = name;
    if(category) query.category = category;
    if(contest) query.contest = contest;

    if(Object.keys(query).length === 0){
      res.status(200).json(new APIError(800, "Invalid parameters"));
      return;
    }

    const result = await problemManager.findProblems(query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(831, "Problem find failed"));
  }

});

// admin only
// router.post("/", async (req, res) => {
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

//     const { id, name, description, source, flag, link, score, category, contest } = req.body;
//     const problem = {
//       id: id,
//       name: name,
//       description: description,
//       source: source,
//       flag: flag,
//       link: link,
//       score: score,
//       category: category,
//       contest: contest,
//     };

//     const result = await problemManager.createProblem(problem);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(830, "Problem create failed"));
//   }
// });


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
    
//     const result = await problemManager.deleteProblem(id);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(832, "Problem delete failed"));
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

//     const { id, name, description, source, flag, link, score, category, contest } = req.body;

//     if (id == undefined) {
//       res.status(200).json(new APIError(800, "Invalid parameters"));
//       return;
//     }

//     const query = {};
//     if (name) query.name = name;
//     if (description) query.description = description;
//     if (source) query.source = source;
//     if (flag) query.flag = flag;
//     if (link) query.link = link;
//     if (score) query.score = score;
//     if (category) query.category = category;
//     if (contest) query.contest = contest;

//     if (Object.keys(query).length === 0) {
//       res.status(200).json(new APIError(800, "Invalid parameters"));
//       return;
//     }
    
//     const result = await problemManager.updateProblem(id, query);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(833, "Problem update failed"));
//   }
// });

router.post('/flag', async (req, res) => {
  try{
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    const { contest, problem, flag, time } = req.body;
    if (id == undefined || flag == undefined) {
      res.status(200).json(new APIError(800, "Invalid parameters"));
      return;
    }

    const contestResult = await contestManager.findContests({ id: contest });
    if (contestResult instanceof APIError) {
      res.status(200).json(contestResult);
      return;
    }

    const participants = contestResult.data[0].participants;
    if (!participants.includes(req.session.id)) {
      res.status(200).json(new APIError(834, "Not a participant"));
      return;
    }

    const problemResult = await problemManager.findProblems({ id: problem });
    if (problemResult instanceof APIError) {
      res.status(200).json(problemResult);
      return;
    }

    if (problemResult.data.length === 0 || problemResult.data.length > 1) {
      res.status(200).json(new APIError(835, "Problem to check flag not found"));
      return;
    }

    if (problemResult.data[0].flag != flag) {
      res.status(200).json(new APIResponse(0, { result: false }));
      return;
    }

    const result = await scoreboardManager.addSolved({
      id: contest, 
      solved: {
        problem: problem,
        score: problemResult.data[0].score,
        account: req.session.id,
        // TODO : convert time to hh:mm:ss
        time: time,
      }
    });

    res.status(200).json(new APIResponse(0, { result: true }));
  }catch(error){
    console.error(error);
    res.status(200).json(new APIError(837, "Problem flag check failed"));
  }
});

module.exports = router;