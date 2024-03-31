const express = require('express');
const { contestManager } = require('../instances');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id, name, manager } = req.query;
    const query = {};
    if (id != undefined) {
      query.id = id;
    }
    if (name != undefined) {
      query.name = name;
    }
    if (manager != undefined) {
      query.manager = manager;
    }
    
    if (Object.keys(query).length === 0) {
      console.log('Invalid parameters');
      res.status(400).send('Invalid parameters');
      return;
    }
    const contests = await contestManager.findContests(query);
    if (contests == undefined) {
      console.log('Contest not found');
      res.status(400).send('Contest not found');
      return;
    }
    console.log('Contest found');
    res.status(200).send(contests);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

router.post("/", async (req, res) => {
  try {
    // session check
    let { id, name, description, manager, begin_at, duration, problems, participants } = req.body;
    // console.log(req.body);
    if(problems == undefined){
      problems = [];
    }

    if(participants == undefined){
      participants = [];
    }


    if(id == undefined || name == undefined || description == undefined || manager == undefined || begin_at == undefined || duration == undefined || problems == undefined || participants == undefined){
      console.log('Invalid parameters');
      res.status(400).send('Invalid parameters');
      return;
    }

    if (req.session.token == undefined) {
      console.log('Token not found');
      res.status(401).send('Unauthorized');
      return;
    }

    if (req.session.token != req.cookies.token) {
      console.log('Token not matched');
      res.status(401).send('Unauthorized');
      return;
    }

    const contests = await contestManager.findContests({ id: id });
    if (Object.keys(contests).length !== 0) {
      res.status(400).send('Contest already exists');
      return;
    }

    const newContest = await contestManager.createContest(id, name, description, manager, begin_at, duration, problems, participants);
    if (newContest == undefined) {
      res.status(400).send('Contest already exists');
      return;
    }

    res.status(200).send(newContest);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

router.delete('/', async (req, res) => {
  try {
    // session check
    if (req.session.token === undefined) {
      console.log('Token not found');
      res.status(401).send('Unauthorized');
      return;
    }

    if (req.session.token != req.cookies.token) {
      console.log('Token not matched');
      res.status(401).send('Unauthorized');
      return;
    }

    const { id } = req.body;
    if (id == undefined) {
      res.status(400).send('Invalid parameters');
      return;
    }

    const contest = await contestManager.findContests({ id: id });
    if (Object.keys(contest).length === 0) {
      res.status(400).send('Contest not found');
      return;
    }

    const result = await contestManager.deleteContest(id);
    if(result === false){
      console.log('Failed to delete contest');
      res.status(500).send('Failed to delete contest');
      return;
    }
    res.status(200).send('Contest deleted');
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

router.put('/', async (req, res) => {
  try {
    // session check
    if (req.session.token == undefined) {
      console.log('Token not found');
      res.status(401).send('Unauthorized');
      return;
    }

    if (req.session.token != req.cookies.token) {
      console.log('Token not matched');
      res.status(401).send('Unauthorized');
      return;
    }

    const { id, name, description, manager, begin_at, duration, problems, participants } = req.body;

    if (id == undefined) {
      console.log('Invalid parameters');
      res.status(400).send('Invalid parameters');
      return;
    }

    const contests = await contestManager.findContests({ id: id });
    if (Object.keys(contests).length === 0) {
      console.log('Contest not found');
      res.status(400).send('Contest not found');
      return;
    }

    const newContest = await contestManager.updateContest(id, name, description, manager, begin_at, duration, problems, participants);
    if (newContest == undefined || newContest == null) {
      console.log('Contest update failed');
      res.status(500).send('Contest update failed');
      return;
    }

    console.log('Contest updated');
    res.status(200).send(newContest);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

module.exports = router;