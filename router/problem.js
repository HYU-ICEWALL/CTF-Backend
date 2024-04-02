const express = require('express');
const { problemManager } = require('../instances');
const { APIResponse } = require('../modules/response');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id, name, category } = req.query;
    
    const query = {};
    if (id != undefined) {
      query.id = id;
    }
    if (name != undefined) {
      query.name = name;
    }
    if (category != undefined) {
      query.category = category;
    }
    if(Object.keys(query).length === 0){
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const problems = await problemManager.findProblems(query);
    if (problems == undefined) {
      console.log('Problem not found');
      res.status(400).json(APIResponse(400, 'Problem not found', null));
      return;
    }

    console.log('Problem found');
    res.status(200).json(APIResponse(200, 'Problem found', problems));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }

});

router.post("/", async (req, res) => {
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
    const { id, name, description, source, flag, link, score, category } = req.body;
    // console.log(req.body);
    if(id == undefined || name == undefined || description == undefined || source == undefined || flag == undefined || link == undefined || score == undefined || category == undefined){
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const problems = await problemManager.findProblems({ id: id });
    if (Object.keys(problems).length !== 0) {
      console.log('Problem already exists');
      res.status(400).json(APIResponse(400, 'Problem already exists', null));
      return;
    }

    const newProblem = await problemManager.createProblem(id, name, description, source, flag, link, score, category);
    if (newProblem == undefined) {
      console.log('Problem create failed');
      res.status(500).json(APIResponse(500, 'Problem create failed', null));
      return;
    }

    console.log('Problem created');
    res.status(200).json(APIResponse(200, 'Problem created', newProblem));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
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

    const problems = await problemManager.findProblems({ id: id });
    if (Object.keys(problems).length === 0) {
      console.log('Problem not found');
      res.status(400).json(APIResponse(400, 'Problem not found', null));
      return;
    }

    const result = await problemManager.deleteProblem(id);
    if(result === false){
      console.log('Problem delete failed');
      res.status(500).json(APIResponse(500, 'Problem delete failed', null));
      return;
    }
    
    console.log('Problem deleted');
    res.status(200).json(APIResponse(200, 'Problem deleted', null));
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

    const { id, name, description, source, flag, link, score, category } = req.body;

    if (id == undefined) {
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const problems = await problemManager.findProblems({ id: id });
    if (Object.keys(problems).length === 0) {
      console.log('Problem not found');
      res.status(400).json(APIResponse(400, 'Problem not found', null));
      return;
    }

    const newProblem = await problemManager.updateProblem(id, name, description, source, flag, link, score, category);
    if (newProblem == undefined || newProblem == null) {
      console.log('Problem update failed');
      res.status(500).json(APIResponse(500, 'Problem update failed', null));
      return;
    }

    console.log('Problem updated');
    res.status(200).json(APIResponse(200, 'Problem updated', newProblem));
  } catch (error) {
    console.log('Internal Server Error');
    console.error(error);
  }
});

module.exports = router;