const express = require('express');
const router = express.Router();

const { accountManager, profileManager, scoreboardManager, contestManager, problemManager } = require('../instances');
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
    // TODO: get problem sets from current contest
    contest = {name: "Test Contest"};
    problems = [
        {
            domain: "pwn",
            name: "test1",
            num: "1"
        },
        {
            domain: "web",
            name: "test2",
            num: "2"
        },
        {
            domain: "forensic",
            name: "test3",
            num: "3"
        },
    ]

    res.render('problems', {contest: contest, problems: problems});
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


module.exports = router;