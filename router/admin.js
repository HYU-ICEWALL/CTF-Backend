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
  console.log(file);
  // const mimetype = filetypes.match(file.mimetype);
  const mimetype = file.originalname.split('.').pop();
  const extname = filetypes.match(path.extname(file.originalname).toLowerCase());

  console.log(mimetype, extname);

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
  console.log(data);
  if (data.chk == undefined || data.chk != ADMIN_CHK) {
    return res.render('login');
  }

  next();
};

/// routings ///
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

  console.log(accountResult.data);

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

router.get('/problems', chkAdmin, async (req, res) => {
  problemManager.findProblems({})
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const problems = result.data;
      res.render('problems', { problems: problems });
    });
});

router.get('/users', chkAdmin, async (req, res) => {
  profileManager.findProfiles({})
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const users = result.data;
      res.render('users', { users: users });
    });
})

router.get('/contests', chkAdmin, async (req, res) => {
  contestManager.findContests({})
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const contests = result.data;
      res.render('contests', { contests: contests });
    });
})

router.get('/upload/problem', chkAdmin, async (req, res) => {
  res.render('upload_problem');
});

router.post('/upload/problem', chkAdmin, upload.single('source'), async (req, res) => {
  const { domain, name, flag, score, difficulty, url, port, description } = req.body;

  problemManager.createProblem({
    name: name,
    description: description,
    file: req.file.filename,
    flag: flag,
    url: url,
    port: port,
    score: score,
    domain: domain,
  })
    .then(response => {
      if (response instanceof APIError) console.log(`file upload error: ${response.message}`);

      res.redirect('/admin/problems');
    }).catch(err => {
      console.log(`file upload error: ${err}`);

      error_res = "<script>alert('problem upload error'); history.go(-1);</script>"
      res.send(error_res);
    })
});

router.post('/modify/problem', chkAdmin, upload.single('source'), async (req, res) => {
  console.log(req);
  const { domain, name, flag, score, difficulty, url, port, description, contest, bef_file } = req.body;

  if(req.file){
    fs.unlink(`/workspace/problems/${bef_file}`, err => {
      if(err) console.log(`[Err] file remove: ${err}`);
    })
  }
 
  const change = {
    name: name,
    description: description,
    src: req.file ? req.file.filename : bef_file,
    flag: flag,
    url: url,
    port: port,
    score: score,
    domain: domain,
    contest: contest,
  }

  problemManager.updateProblem(change)
    .then(r => {
      if(r instanceof APIError) console.log(`file modify error: ${r.message}`);

      res.redirect('/admin/problems');
    }).catch(err => {
      console.log(`file modify error: ${err}`);

      error_res = "<script>alert('problem modify error'); history.go(-1);</script>"
      res.send(error_res);
    })
});

router.get('/problem/:id', chkAdmin, async (req, res) => {
  const id = req.params.id;
  
  problemManager.findProblems({_id: id})
    .then(r => {
      console.log(r);
      if(r instanceof APIError) return res.status(500).send(`cannot find problem: ${r.message}`);
      else return res.status(200).json(r);
    })
    .catch(err => {
      console.log(`[Err] find problem: ${err}`);
      return res.status(500).send('Cannot find problem');
    })
});

router.delete('/problem/:id', chkAdmin, async (req, res) => {
  const id = req.params.id;
  problemManager.deleteProblems({_id: id})
    .then(r => {
      if(r instanceof APIError) return res.status(500).send(`Cannot remove problem: ${r.message}`);
      else return res.status(200).send('removed problem successfully');
    })
    .catch(err => {
      console.log(`[Err] cannot remove problem: ${err}`);
      return res.status(500).send('cannot remove problem');
    });
});

router.get('/upload/contest', chkAdmin, async (req, res) => {
  problemManager.findProblems({ contest: { $exists: false } })
    .then(result => {
      if (result instanceof APIError) return res.send(`Error: ${result.data}`);

      const problems = result.data;
      res.render('upload_contest', { problems: problems });
    })
});

router.post('/upload/contest', chkAdmin, async (req, res) => {
  const { name, selection, description } = req.body;
  const problems_name = [];

  if (Array.isArray(selection)) {
    selection.forEach(async id => {
      const key = { _id: id };
      problemManager.findProblems(key)
        .then(async result => {
          if (result instanceof APIError) {
            return res.send("<script>alert('pick more than 2 problems'); history.go(-1);</script>")
          }

          let new_doc = result.data[0];
          problems_name.push(new_doc.name);

          new_doc.contest = name;
          await problemManager.updateProblem(new_doc);
        })

    });

    const contest = {
      name: name,
      description: description,
      problems: problems_name,
      begin_at: "default",
      end_at: "default",
    };

    contestManager.createContest(contest)
      .then(result => {
        if (result instanceof APIError) return res.send(`Error: ${result.data}`);

        return res.redirect('/admin/contests');
      })
  } else {
    return res.send("<script>alert('pick more than 2 problems'); history.go(-1);</script>")
  }
})

module.exports = router;