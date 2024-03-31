const express = require('express');
const { profileManager } = require('../instances');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    if(id == undefined){
      console.log('Invalid id');
      res.status(400).send('Invalid id');
      return;
    }
    
    const profile = await profileManager.findProfile({id: id});
    if(profile == undefined){
      console.log('Profile not found');
      res.status(400).send('Profile not found');
      return;
    }

    console.log('Profile found');
    res.status(200).send(profile);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
  
});

router.post("/", async (req, res) => {
  try {
    // session check
    if(req.session.token == undefined){
      console.log('Token not found');
      res.status(401).send('Unauthorized');
      return;
    }

    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(401).send('Unauthorized');
      return;
    }
    const { id, email, name, organization, department } = req.body;
    // console.log(req.body);
    if(id == undefined || email == undefined || name == undefined || organization == undefined || department == undefined){
      console.log('Invalid parameters');
      res.status(400).send('Invalid parameters');
      return;
    }

    const profiles = await profileManager.findProfile({id: id});
    if(Object.keys(profiles).length !== 0){
      res.status(400).send('Profile already exists');
      return;
    }

    const newProfile = await profileManager.createProfile(id, email, name, organization, department);
    if(newProfile == undefined){
      res.status(400).send('Profile already exists');
      return;
    }

    res.status(200).send(newProfile);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

router.delete('/', async (req, res) => {
  try {
    // session check
    if(req.session.token === undefined){
      console.log('Token not found');
      res.status(401).send('Unauthorized');
      return;
    }

    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(401).send('Unauthorized');
      return;
    }
    
    const { id } = req.body;
    if(id == undefined){
      res.status(400).send('Invalid parameters');
      return;
    }

    const profile = await profileManager.findProfile({id: id});
    if(Object.keys(profile).length === 0){
      res.status(400).send('Profile not found');
      return;
    }

    const result = await profileManager.deleteProfile(id);
    if(result === false){
      console.log('Failed to delete profile');
      res.status(500).send('Failed to delete profile');
      return;
    }
    res.status(200).send('Profile deleted');
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

    const { id, name, organization, department } = req.body;
    
    if(id == undefined){
      console.log('Invalid parameters');
      res.status(400).send('Invalid parameters');
      return;
    }

    const profile = await profileManager.findProfile({id: id});
    if(Object.keys(profile).length === 0){
      console.log('Profile not found');
      res.status(400).send('Profile not found');
      return;
    }

    const newProfile = await profileManager.updateProfile(id, name, organization, department);
    if(newProfile == undefined || newProfile == null){
      console.log('Profile update failed');
      res.status(500).send('Profile update failed');
      return;
    }

    console.log('Profile updated');
    res.status(200).send(newProfile);
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

module.exports = router;