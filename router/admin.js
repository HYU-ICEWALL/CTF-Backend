const express = require('express');
const router = express.Router();

const { accountManager, profileManager, scoreboardManager, contestManager, problemManager } = require('../instances');
const { APIError } = require('../modules/response');
const ADMIN_CHK = process.env.ADMIN_CHK;

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
    // fileFilter: fileFilter
});
///// defining upload finished /////

///// middleware : check if request is admin /////
const chkAdmin = async (req, res, next) => {
    const session = await sessionManager.checkValidSession(req);
    if(session instanceof APIError){
        return res.status(200).json(session);
    }

    if(req.session.data !== ADMIN_CHK){
        return res.status(400).json({msg: "invalid admin checking"});
    }

    next();
};


/// routings ///
router.get('/', async (req, res) => {
    res.render('index');
});

router.get('/problems', async (req, res) => {
    problemManager.findProblems({})
        .then(result => {
            if (result instanceof APIError) return res.send(`Error: ${result.data}`);

            const problems = result.data;
            res.render('problems', {problems: problems});
        });
});

router.get('/users', async(req, res) => {
    profileManager.findProfiles({})
        .then(result => {
            if(result instanceof APIError) return res.send(`Error: ${result.data}`);

            const users = result.data;
            res.render('users', {users: users});
        });
})

router.get('/contests', async(req, res) => {
    contestManager.findContests({})
        .then(result => {
            if (result instanceof APIError) return res.send(`Error: ${result.data}`);

            const contests = result.data;
            res.render('contests', {contests: contests});
        });
})

router.get('/upload/problem', async (req, res) => {
    res.render('upload_problem');
});

router.post('/upload/problem', upload.single('source'), async (req, res) => {
    const {domain, name, flag, score, difficulty, url, port, description } = req.body;
    
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
        if(response instanceof APIError) console.log(`file upload error: ${response.message}`);

        res.redirect('/admin/problems');
    }).catch(err => {
        console.log(`file upload error: ${err}`);

        error_res = "<script>alert('problem upload error'); history.go(-1);</script>"
        res.send(error_res);
    })
});

router.get('/upload/contest', async (req, res) => {
    problemManager.findProblems({})
        .then(result => {
            if(result instanceof APIError) return res.send(`Error: ${result.data}`);

            const problems = result.data;
            res.render('upload_contest', {problems: problems});
        })
});

router.post('/upload/contest', async (req, res) => {
    const {name, selection, description} = req.body;
    const problems_name = [];

    if(Array.isArray(selection)){
        selection.forEach(async id => {
            const key = {_id: id};
            problemManager.findProblems(key)
                .then(async result => {
                    if(result instanceof APIError){
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
                if(result instanceof APIError) return res.send(`Error: ${result.data}`);

                return res.redirect('/admin/contests');
            })
    }else{
        return res.send("<script>alert('pick more than 2 problems'); history.go(-1);</script>")
    }
})

module.exports = router;