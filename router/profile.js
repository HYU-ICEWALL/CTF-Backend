const express = require('express');
const { profileManager } = require('../instances');
const { APIResponse } = require('../modules/response');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    if(id == undefined){
      console.log('Invalid id');
      res.status(400).json(APIResponse(400, 'Invalid id', null));
      return;
    }
    
    const profile = await profileManager.findProfile({id: id});
    if(profile == undefined){
      console.log('Profile not found');
      res.status(400).json(APIResponse(400, 'Profile not found', null));
      return;
    }

    console.log('Profile found');
    res.status(200).json(APIResponse(200, 'Profile found', profile));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
  
});

router.post("/", async (req, res) => {
  try {
    // session check
    if(req.session.token == undefined){
      console.log('Token not found');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }
    const { id, email, name, organization, department } = req.body;
    // console.log(req.body);
    if(id == undefined || email == undefined || name == undefined || organization == undefined || department == undefined){
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const profiles = await profileManager.findProfile({id: id});
    if(Object.keys(profiles).length !== 0){
      console.log('Profile already exists');
      res.status(400).json(APIResponse(400, 'Profile already exists', null));
      return;
    }

    const newProfile = await profileManager.createProfile(id, email, name, organization, department);
    if(newProfile == undefined){
      console.log('Profile creation failed');
      res.status(500).json(APIResponse(500, 'Profile creation failed', null));
      return;
    }

    console.log('Profile created');
    res.status(200).json(APIResponse(200, 'Profile created', newProfile));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

router.delete('/', async (req, res) => {
  try {
    // session check
    if(req.session.token === undefined){
      console.log('Token not found');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }
    
    const { id } = req.body;
    if(id == undefined){
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const profile = await profileManager.findProfile({id: id});
    if(Object.keys(profile).length === 0){
      console.log('Profile not found');
      res.status(400).json(APIResponse(400, 'Profile not found', null));
      return;
    }

    const result = await profileManager.deleteProfile(id);
    if(result === false){
      console.log('Failed to delete profile');
      res.status(500).json(APIResponse(500, 'Failed to delete profile', null));
      return;
    }

    console.log('Profile deleted');
    res.status(200).json(APIResponse(200, 'Profile deleted', null));
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

    const { id, name, organization, department } = req.body;
    
    if(id == undefined){
      console.log('Invalid parameters');
      res.status(400).json(APIResponse(400, 'Invalid parameters', null));
      return;
    }

    const profile = await profileManager.findProfile({id: id});
    if(Object.keys(profile).length === 0){
      console.log('Profile not found');
      res.status(400).json(APIResponse(400, 'Profile not found', null));
      return;
    }

    const newProfile = await profileManager.updateProfile(id, name, organization, department);
    if(newProfile == undefined || newProfile == null){
      console.log('Profile update failed');
      res.status(500).json(APIResponse(500, 'Profile update failed', null));
      return;
    }

    console.log('Profile updated');
    res.status(200).json(APIResponse(200, 'Profile updated', newProfile));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

module.exports = router;