const express = require('express');
const { problemManager } = require('../instances');
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
      res.status(400).send('Invalid parameters');
      return;
    }

    const problems = await problemManager.findProblems(query);
    if (problems == undefined) {
      console.log('Problem not found');
      res.status(400).send('Problem not found');
      return;
    }

    console.log('Problem found');
    res.status(200).send(problems);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }

});

router.post("/", async (req, res) => {
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
    const { id, name, description, source, flag, link, score, category } = req.body;
    // console.log(req.body);
    if(id == undefined || name == undefined || description == undefined || source == undefined || flag == undefined || link == undefined || score == undefined || category == undefined){
      console.log('Invalid parameters');
      res.status(400).send('Invalid parameters');
      return;
    }

    const problems = await problemManager.findProblems({ id: id });
    if (Object.keys(problems).length !== 0) {
      res.status(400).send('Problem already exists');
      return;
    }

    const newProblem = await problemManager.createProblem(id, name, description, source, flag, link, score, category);
    if (newProblem == undefined) {
      res.status(400).send('Problem already exists');
      return;
    }

    res.status(200).send(newProblem);
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

    const problems = await problemManager.findProblems({ id: id });
    if (Object.keys(problems).length === 0) {
      res.status(400).send('Problem not found');
      return;
    }

    const result = await problemManager.deleteProblem(id);
    if(result === false){
      console.log('Problem delete failed');
      res.status(500).send('Problem delete failed');
      return;
    }
    res.status(200).send('Problem deleted');
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

    const { id, name, description, source, flag, link, score, category } = req.body;

    if (id == undefined) {
      console.log('Invalid parameters');
      res.status(400).send('Invalid parameters');
      return;
    }

    const problems = await problemManager.findProblems({ id: id });
    if (Object.keys(problems).length === 0) {
      console.log('Problem not found');
      res.status(400).send('Problem not found');
      return;
    }

    const newProblem = await problemManager.updateProblem(id, name, description, source, flag, link, score, category);
    if (newProblem == undefined || newProblem == null) {
      console.log('Problem update failed');
      res.status(500).send('Problem update failed');
      return;
    }

    console.log('Problem updated');
    res.status(200).send(newProblem);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

module.exports = router;