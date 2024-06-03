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

///// define upload logic /////
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(file);
    cb(null, '/workspace/problems/');
  },
  filename: (req, file, cb) => {
    const filename = md5(Date.now());
    const extension = path.extname(file.originalname);
    cb(null, filename + extension);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = '/zip/';
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
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
  console.log(req.session);
  const session = await sessionManager.checkValidSession(req);

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
    // id: id,
    // token: token,
    // chk: ADMIN_CHK
  });

  req.session.save(err => {
    if (err !== undefined) {
      console.log(`Error: login error ${err}`);
      return res.redirect('/redirect/login');
    }
    return res.redirect('/admin');
  });

  // if(id === ADMIN_ID && passwd === ADMIN_PASSWORD){
  //     const token = sessionManager.createSessionToken();
  //     req.session.data = {
  //         id: ADMIN_ID,
  //         token: token,
  //         chk: ADMIN_CHK
  //     };

  //     console.log(req.session);
  //     req.session.save(err => {
  //         if(err !== undefined){
  //             console.log(`Error: login error ${err}`);
  //         }

  //         return res.redirect('/admin');
  //     });

  // }else{
  //     return res.redirect('/login');
  // }
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