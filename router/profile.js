const express = require('express');
const { profileManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    if (id == undefined) {
      res.status(200).json(new APIError(800, "Invalid parameters"));
    }

    const result = await profileManager.findProfile({ id: id });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(841, "Profile find failed"));
  }
});


router.post("/", async (req, res) => {
  try {
    if (!req.session || !req.session.token || !req.session.id) {
      res.status(200).json(new APIError(602, 'Session not found'));
      return;
    }

    if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
      res.status(200).json(new APIError(611, 'Cookie malformed'));
      return;
    }

    const { id, email, name, organization, department } = req.body;
    if (id == undefined || email == undefined || name == undefined || organization == undefined || department == undefined) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    const result = await profileManager.createProfile(id, email, name, organization, department);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(840, 'Profile create failed'));
  }
});

router.delete('/', async (req, res) => {
  try {
    if (!req.session || !req.session.token || !req.session.id) {
      res.status(200).json(new APIError(602, 'Session not found'));
      return;
    }

    if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
      res.status(200).json(new APIError(611, 'Cookie malformed'));
      return;
    }

    const { id } = req.body;
    if (id == undefined) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(842, 'Profile delete failed'));
  }
});

router.put('/', async (req, res) => {
  try {
    if (!req.session || !req.session.token || !req.session.id) {
      res.status(200).json(new APIError(602, 'Session not found'));
      return;
    }

    if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
      res.status(200).json(new APIError(611, 'Cookie malformed'));
      return;
    }

    const { id, name, organization, department } = req.body;
    if (id == undefined){
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }
    const query = {};
    if (name != undefined) query.name = name;
    if (organization != undefined) query.organization = organization;
    if (department != undefined) query.department = department;

    const result = await profileManager.updateProfile(id, query);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(843, 'Profile update failed'));
  }
});

module.exports = router;