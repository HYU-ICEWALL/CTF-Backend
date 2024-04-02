const express = require('express');
const { contestManager } = require('../instances');
const { APIResponse } = require('../modules/response');
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
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }
    const contests = await contestManager.findContests(query);
    if (contests == undefined) {
      console.log('Contest not found');
      res.status(400).json(APIResponse(400, 'Contest not found', null));
      return;
    }
    console.log('Contest found');
    res.status(200).json(APIResponse(200, 'Contest found', contests));
  } catch (error) {
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
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
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    if (req.session.token == undefined) {
      console.log('Token not found');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    if (req.session.token != req.cookies.token) {
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    const contests = await contestManager.findContests({ id: id });
    if (Object.keys(contests).length !== 0) {
      console.log('Contest already exists');
      res.status(400).json(APIResponse(400, 'Contest already exists', null));
      return;
    }

    const newContest = await contestManager.createContest(id, name, description, manager, begin_at, duration, problems, participants);
    if (newContest == undefined) {
      console.log('Contest creation failed');
      res.status(500).json(APIResponse(500, 'Contest creation failed', null));
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
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    if (req.session.token != req.cookies.token) {
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    const { id } = req.body;
    if (id == undefined) {
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const contest = await contestManager.findContests({ id: id });
    if (Object.keys(contest).length === 0) {
      console.log('Contest not found');
      res.status(400).json(APIResponse(400, 'Contest not found', null));
      return;
    }

    const result = await contestManager.deleteContest(id);
    if(result === false){
      console.log('Failed to delete contest');
      res.status(500).json(APIResponse(500, 'Failed to delete contest', null));
      return;
    }

    console.log('Contest deleted');
    res.status(200).json(APIResponse(200, 'Contest deleted', null));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

router.put('/', async (req, res) => {
  try {
    // session check
    if (req.session.token == undefined) {
      console.log('Token not found');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    if (req.session.token != req.cookies.token) {
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    const { id, name, description, manager, begin_at, duration, problems, participants } = req.body;

    if (id == undefined) {
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const contests = await contestManager.findContests({ id: id });
    if (Object.keys(contests).length === 0) {
      console.log('Contest not found');
      res.status(400).json(APIResponse(400, 'Contest not found', null));
      return;
    }

    const newContest = await contestManager.updateContest(id, name, description, manager, begin_at, duration, problems, participants);
    if (newContest == undefined || newContest == null) {
      console.log('Contest update failed');
      res.status(500).json(APIResponse(500, 'Contest update failed', null));
      return;
    }

    console.log('Contest updated');
    res.status(200).json(APIResponse(200, 'Contest updated', newContest));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

module.exports = router;