require('dotenv').config();
const express = require('express');
const router = express.Router();

const { accountManager, profileManager, scoreboardManager, contestManager, problemManager } = require('../instances');
const { APIError } = require('../modules/response');
const { ADMIN_CHK, ADMIN_ID, ADMIN_PASSWORD } = process.env;

const { sessionManager } = require('../instances');

const multer = require('multer');
const md5 = require('md5');
const path = require('path');
const fs = require('fs');

///// define upload logic /////
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file);
    cb(null, './problems/');
  },
  filename: (req, file, cb) => {
    const filename = md5(Date.now());
    const extension = path.extname(file.originalname);
    cb(null, filename + extension);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = '/zip/';
  const mimetype = file.originalname.split('.').pop();
  const extname = filetypes.match(path.extname(file.originalname).toLowerCase());
  if (mimetype == "zip" && extname) {
    return cb(null, true);
  } else {
    cb(new Error('ZIP 파일만 업로드할 수 있습니다.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});
///// defining upload finished /////

///// middleware : check if request is admin /////
const chkAdmin = async (req, res, next) => {
  const session = await sessionManager.checkValidSession(req);
  console.log(session);

  if (session instanceof APIError) {
    return res.render('login');
  }

  const data = JSON.parse(req.session.data);
  if (data.chk == undefined || data.chk != ADMIN_CHK) {
    return res.render('login');
  }

  next();
};

/// routings ///


// login routes
router.get('/', chkAdmin, async (req, res) => {
  res.render('index');
});
router.get('/login', async (req, res) => {
  return res.render('login');
})

router.post('/login', async (req, res) => {
  const { id, passwd } = req.body;
  // console.log(ADMIN_ID);

  const accountResult = await accountManager.findAccountByPassword({
    id: id,
    password: passwd
  });

  if (accountResult instanceof APIError) {
    return res.redirect('/admin/login');
  }

  if (accountResult.data.authority !== 1) {
    return res.redirect('/admin/login');
  }

  const token = sessionManager.createSessionToken();
  req.session.data = JSON.stringify({
    id: id,
    token: token,
    chk: ADMIN_CHK
  });

  req.session.save(err => {
    if (err !== undefined) {
      console.log(`Error: login error ${err}`);
      return res.redirect('/redirect/login');
    }
    return res.redirect('/admin');
  });
})

// problem routes
router.get('/problems', chkAdmin, async (req, res) => {
  problemManager.findProblems({})
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const problems = result.data;
      res.render('problems', { problems: problems });
    });
});

router.get('/problem/:id', chkAdmin, async (req, res) => {
  const id = req.params.id;

  const problem = await problemManager.findProblems({ _id: id });
  if (problem instanceof APIError) return res.send(`Error: ${problem.data}`);

  // TODO : problem page
  res.send("");
});


router.get('/upload/problem', chkAdmin, async (req, res) => {
  res.render('upload_problem');
});

router.post('/upload/problem', chkAdmin, upload.single('source'), async (req, res) => {
  const { domain, name, flag, score, url, port, description } = req.body;

  problemManager.createProblem({
    name: name,
    description: description,
    file: req.file.filename,
    flag: flag,
    url: url,
    port: port,
    score: score,
    domain: domain,
    contest: ""
  })
    .then(response => {
      if (response instanceof APIError) throw response;

      res.redirect('/admin/problems');
    }).catch(err => {
      console.log(`file upload error: ${err}`);
      error_res = "<script>alert('problem upload error'); history.go(-1);</script>"
      res.send(error_res);
    })
});

router.post('/modify/problem', chkAdmin, upload.single('source'), async (req, res) => {
  const { domain, name, flag, score, url, port, description, bef_file, p_id } = req.body;

  if (req.file && fs.existsSync(`./problems/${bef_file}`)) {
    console.log(bef_file);
    fs.unlink(`./problems/${bef_file}`, err => {
      if (err) console.log(`[Err] file remove: ${err}`);
    });
  }

  const change = {
    p_id: p_id,
    name: name,
    description: description,
    src: req.file ? req.file.filename : bef_file,
    flag: flag,
    url: url,
    port: port,
    score: score,
    domain: domain
  }

  problemManager.updateProblem(change)
    .then(response => {
      if (response instanceof APIError) throw response;

      res.redirect('/admin/problems');
    }).catch(err => {
      console.log(`file modify error: ${err}`);

      error_res = "<script>alert('problem modify error'); history.go(-1);</script>"
      res.send(error_res);
    })
});

router.delete('/problem/:id', chkAdmin, async (req, res) => {
  const id = req.params.id;
  const problem = await problemManager.findProblems({ _id: id });
  if (problem instanceof APIError) return res.status(500).send(`cannot find problem: ${problem.message}`);
  console.log(problem.data);

  const file = problem.data[0].file;
  fs.unlink(`./problems/${file}`, err => {
    if (err) res.send(`Error: ${err}`);
    problemManager.deleteProblems({ _id: id })
      .then(response => {
        if (response instanceof APIError) return res.status(500).send(`Cannot remove problem: ${response.message}`);
        return res.status(200).send('removed problem successfully');
      })
      .catch(err => {
        console.log(`[Err] cannot remove problem: ${err}`);
        return res.status(500).send('cannot remove problem');
      });
  });

});

// user routes
router.get('/users', chkAdmin, async (req, res) => {
  profileManager.findProfiles({})
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const users = result.data;
      res.render('users', { users: users });
    });
})

// contest routes
router.get('/contests', chkAdmin, async (req, res) => {
  contestManager.findContests({})
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const contests = result.data;
      res.render('contests', { contests: contests });
    });
})


router.get('/contest/:id', chkAdmin, async (req, res) => {
  const id = req.params.id;
  
  const contest = await contestManager.findContests({ _id: id });
  const scoreboard = await scoreboardManager.findScoreboards({ contest: contest.data[0].name });
  if (contest instanceof APIError || scoreboard instanceof APIError) return res.send(`Error: ${contest.data}`);
  
  /*
  ranking result example : [{"rank":1,"account":"test","total":302},{"rank":2,"account":"qwe123","total":280}]
  */
  const ranking = await scoreboardManager.getRanking({ contest: contest.data[0].name });
  if (ranking instanceof APIError) return res.send(`Error: ${ranking.data}`);

  // TODO : contest page
  res.send("");
});

router.get('/upload/contest', chkAdmin, async (req, res) => {
  problemManager.findProblems()
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const problems = result.data;
      res.render('upload_contest', { problems: problems });
    })
});

router.post('/upload/contest', chkAdmin, async (req, res) => {
  try{
    const { name, selection, description, begin_at, end_at, state } = req.body;
      if (Array.isArray(selection)) {
        const contest = {
          name: name,
          description: description,
          problems: selection,
          begin_at: begin_at,
          end_at: end_at,
          state: state
        };
    
        contestManager.createContest(contest)
          .then(async result => {
            if (result instanceof APIError) return res.send(`Error: ${result.data}`);
    
            for (let i = 0; i < selection.length; i++) {
              await problemManager.updateProblemContestWithName({
                name: selection[i],
                contest: name
              });
            }
    
            const scoreboardResult = await scoreboardManager.createScoreboard({ contest: name, begin_at: begin_at, end_at: end_at});
            if (scoreboardResult instanceof APIError) return res.send(`Error: ${scoreboardResult}`);
    
            return res.redirect('/admin/contests');
          });
      } else {
        return res.send("<script>alert('pick more than 2 problems'); history.go(-1);</script>")
      }
  }catch(err){
    console.log(`[Err] upload contest: ${err}`);
    return res.send(`Error: ${err}`);
  }


});

router.delete('/contest/:id', chkAdmin, async (req, res) => {
  const id = req.params.id;

  const contest = await contestManager.findContests({ _id: id });
  if (contest instanceof APIError) return res.status(500).send(`cannot find contest: ${contest.message}`);

  const problems = contest.data[0].problems;
  for (let i = 0; i < problems.length; i++) {
    try{
      await problemManager.updateProblemContestWithName({
        name: problems[i],
        contest: ''
      });
    }catch(err){
      console.log(`[Err] cannot update problem: ${err}`);
    }
  }

  contestManager.deleteContests({ _id: id })
    .then(r => {
      if (r instanceof APIError) return res.status(500).send(`Cannot remove contest: ${r.message}`);

      const scoreboardResult = scoreboardManager.deleteScoreboards({ contest: contest.data[0].name });
      if (scoreboardResult instanceof APIError) return res.send(`Error: ${scoreboardResult}`);
      else return res.status(200).send('removed contest successfully');
    })
    .catch(err => {
      console.log(`[Err] cannot remove contest: ${err}`);
      return res.status(500).send('cannot remove contest');
    });
});

router.post('/modify/contest', chkAdmin, async (req, res) => {
  const { name, selection, description, begin_at, end_at, state, c_id } = req.body;

  if (Array.isArray(selection)) {
    const contest = await contestManager.findContests({ _id: c_id });
    if (contest instanceof APIError) return res.send(`Error: ${contest.data}`);

    const problems = contest.data[0].problems;
    for (let i = 0; i < problems.length; i++) {
      try{
        await problemManager.updateProblemContestWithName({
          name: problems[i],
          contest: ''
        });
      }catch(err){
        console.log(`[Err] cannot update problem: ${err}`);
      }
    }

    const change = {
      c_id: c_id,
      name: name,
      description: description,
      problems: selection,
      begin_at: begin_at,
      end_at: end_at,
      state: state
    };

    contestManager.updateContest(change)
      .then(async result => {
        if (result instanceof APIError) console.log(`Error: ${result.data}`);

        for (let i = 0; i < selection.length; i++) {
          await problemManager.updateProblemContestWithName({
            name: selection[i],
            contest: name
          });
        }

        const scoreboardResult = await scoreboardManager.updateScoreboard({ contest: name, begin_at: begin_at, end_at: end_at });
        if (scoreboardResult instanceof APIError) return res.send(`Error: ${scoreboardResult}`);

        return res.redirect('/admin/contests');
      })

  } else {
    return res.send("<script>alert('pick more than 2 problems'); history.go(-1);</script>")
  }
});



module.exports = router;