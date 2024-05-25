const express = require('express');
const { profileManager, sessionManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // check parameters
    const { id } = req.query;
    if (id == undefined) {
      res.status(200).json(new APIError(800, "Invalid parameters"));
      return;
    }

    // find profile
    const result = await profileManager.findProfiles({ id: id });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(841, "Profile find failed"));
  }
});

router.put('/', async (req, res) => {
  try {
    // check session
    const sessionResult = await sessionManager.checkValidSession(req.session);

    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    // check parameters
    const { id, name, organization, department } = req.body;
    
    if (req.session.data.id != id){
      res.status(200).json(new APIError(801, 'Permission denied'));
      return;
    }

    if (id == undefined){
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }
    const query = {
      id: id,
    };
    if (name != undefined) query.name = name;
    if (organization != undefined) query.organization = organization;
    if (department != undefined) query.department = department;

    if (Object.keys(query).length == 1){
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    // update profile
    const result = await profileManager.updateProfile(query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(843, 'Profile update failed'));
  }
});

module.exports = router;