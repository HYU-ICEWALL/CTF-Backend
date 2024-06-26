const express = require('express');
const { profileManager, sessionManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // check parameters
    const { id, name, organization, department } = req.query;
    const query = {};
    if (id) query.id = id;
    if (name) query.name = name;
    if (organization) query.organization = organization;
    if (department) query.department = department;
    
    // find profile
    const result = await profileManager.findProfiles(query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(400, "Profile find failed"));
  }
});

router.put('/', async (req, res) => {
  try {
    // check session
    const sessionResult = await sessionManager.checkValidSession(req);

    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    // check parameters
    const { name, organization, department } = req.body;
    const data = JSON.parse(req.session.data);
    const query = {
      id: data.id,
    };
    
    if (name != undefined) query.name = name;
    if (organization != undefined) query.organization = organization;
    if (department != undefined) query.department = department;

    if (Object.keys(query).length == 1){
      res.status(200).json(new APIError(411, 'Invalid parameters'));
      return;
    }

    // update profile
    const result = await profileManager.updateProfile(query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(410, 'Profile update failed'));
  }
});

router.get('/solved', async (req, res) => {
  try {
    // check parameters
    const { id } = req.query;
    if (id == undefined) {
      res.status(200).json(new APIError(421, 'Invalid parameters'));
      return;
    }

    // find profile
    const profileResult = await profileManager.findProfiles({ id: id });
    if (profileResult instanceof APIError) {
      res.status(200).json(profileResult);
      return;
    }

    if (profileResult.data.length != 1) {
      res.status(200).json(new APIError(422, 'Profile not found'));
      return;
    }
    const solved = profileResult.data[0].solved;
    
    res.status(200).json(new APIResponse(0, solved));
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(420, 'Profile solved find failed'));
  }
});

module.exports = router;