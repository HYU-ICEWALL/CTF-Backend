const express = require('express');
const router = express.Router();

const { accountManager, profileManager, scoreboardManager, contestManager, problemManager } = require('../instances');
const { APIError } = require('../modules/response');
const admin_ip = process.env.ADMIN || false;

const chkIp = async (req, res, next) => {
    if(admin_ip && admin_ip !== req.ip) next();

    next();
};

router.get('/', async (req, res) => {
    // if(!req.session || req.session.id == {ADMIN ID}){
    //     res.render('login');
    // }

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

router.post('/upload/problem', async (req, res) => {
    const { name: name, description: description, source: source, flag: flag, url: url, port: port, score: score, category: category } = req.body;
    // if(!name || !description || !source || !flag || !url || !port || !score || !category){
    //     res.status(200).json(new APIError(800, "Invalid parameters"));
    //     return;
    // }

    console.log(req.body);
    return res.send("success")
    
    const problemResult = await problemManager.createProblem({
        name: name,
        description: description,
        source: source,
        flag: flag,
        url: url,
        port: port,
        score: score,
        category: category
    });

    res.status(200).json(problemResult);
});


module.exports = router;