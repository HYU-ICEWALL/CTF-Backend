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
    const contestResult = await contestManager.findContests({});
    if(contestResult instanceof APIError){
        res.status(200).json(contestResult);
        return;
    }

    const contests = contestResult.data;
    const contest = contests[0];

    const problemResult = await problemManager.findProblems({contest : contest._id});
    if(problemResult instanceof APIError){
        res.status(200).json(problemResult);
        return;
    }

    const problems = problemResult.data;

    console.log(contest, problems);
    res.json({contest: contest, problems: problems})

    // res.render('problems', {contest: contest, problems: problems});
});

router.get('/users', async(req, res) => {
    const users = [
        {
            name: "dongha",
            depart: "컴퓨터소프트웨어학부",
            rank: 1,
            score: 32
        },
        {
            name: "서윤호",
            depart: "컴퓨터소프트웨어학부",
            rank: 2,
            score: 27
        }
    ]
    res.render('users', {users: users});
})

router.get('/contests', async(req, res) => {
    const contests = [
        {
            name: "contest1",
            people: 37,
            date: "2024-05-25"
        },
        {
            name: "contest2",
            people: 32,
            date: "2024-05-26"
        }
    ];

    res.render('contests', {contests: contests});
})

router.get('/upload/problem', async (req, res) => {
    res.render('upload_problem');
})

router.get('/upload/contest', async (req, res) => {
    const problems = [
        {
            id: "123",
            domain: "pwn",
            name: "test1",
            difficult: "1"
        },
        {
            id: "1234",
            domain: "web",
            name: "test2",
            difficult: "2"
        },
        {
            id: "12345",
            domain: "forensic",
            name: "test3",
            difficult: "3"
        },
    ]

    res.render('upload_contest', {problems: problems});
});

router.post('/upload/problem', upload.single('source'), async (req, res) => {
    const {domain, name, flag, score, difficulty, url, port, description } = req.body;
    
    problemManager.createProblem({
        name: name,
        description: description,
        source: req.file.filename,
        flag: flag,
        url: url,
        port: port,
        score: score,
        category: domain
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


module.exports = router;