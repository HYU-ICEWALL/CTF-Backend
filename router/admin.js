const express = require('express');
const router = express.Router();

const { accountManager } = require('../instances');
const admin_ip = process.env.ADMIN || false;


const chkIp = async (req, res, next) => {
    if(admin_ip && admin_ip !== req.ip) next();

    next();
}

router.get('/', async (req, res) => {
    // if(!req.session || req.session.id == {ADMIN ID}){
    //     res.render('login');
    // }

    res.render('base', {body: './home/index'});
})


module.exports = router;