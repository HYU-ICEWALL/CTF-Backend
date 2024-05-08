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
    const result = await profileManager.findProfile({ id: id });
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(841, "Profile find failed"));
  }
});

// deprecated
// router.post("/", async (req, res) => {
//   try {
//     const sessionResult = await sessionManager.checkValidSession(req);
//     if (sessionResult instanceof APIError) {
//       res.status(200).json(sessionResult);
//       return;
//     }
    
//     const { id, email, name, organization, department } = req.body;
//     if (req.session.id != id){
//       res.status(200).json(new APIError(801, 'Permission denied'));
//       return;
//     }
    
//     if (id == undefined || email == undefined || name == undefined || organization == undefined || department == undefined) {
//       res.status(200).json(new APIError(800, 'Invalid parameters'));
//       return;
//     }

//     const result = await profileManager.createProfile({
//       id: id,
//       email: email,
//       name: name,
//       organization: organization,
//       department: department,
//     });

//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(840, 'Profile create failed'));
//   }
// });

// admin only
// router.delete('/', async (req, res) => {
//   try {
//     if (!req.session || !req.session.token || !req.session.id) {
//       res.status(200).json(new APIError(602, 'Session not found'));
//       return;
//     }

//     if (req.session.token != req.cookies.token || req.session.id != req.cookies.id) {
//       res.status(200).json(new APIError(611, 'Cookie malformed'));
//       return;
//     }

//     const { id } = req.body;
//     if (id == undefined) {
//       res.status(200).json(new APIError(800, 'Invalid parameters'));
//       return;
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(200).json(new APIError(842, 'Profile delete failed'));
//   }
// });

router.put('/', async (req, res) => {
  try {
    // check session
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    // check parameters
    const { id, name, organization, department } = req.body;
    
    if (req.session.id != id){
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