const express = require('express');
const router = express.Router();
const { accountManager, sessionManager, profileManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');

router.post('/', async (req, res) => {
  try {
    if (!!req.session && !!req.session.id && !!req.session.token) {
      res.status(200).json(new APIError(601, 'Session found'));
      return;
    }

    const { email, id, password, name, organization, department } = req.body;
    if (!email || !id || !password || !name || !organization || !department) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    const accountResult = await accountManager.createAccount({
      email: email,
      id: id,
      password: password,
    });

    if (accountResult instanceof APIError) {
      res.status(200).json(accountResult);
      return;
    }

    const profileResult = await accountManager.createProfile({
      id: id,
      email: email,
      name: name,
      organization: organization,
      department: department,
    });

    if (profileResult instanceof APIError) {
      res.status(200).json(profileResult);
      return;
    }

    res.status(200).json(new APIResponse(0, { id: id }));
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(810, 'Account register failed'));
  }
});

router.post('/login', async (req, res) => {
  try {
    if(!!req.session && !!req.session.id && !!req.session.token)
    {
      res.status(200).json(new APIError(601, 'Session found'));
      return;
    }

    const { id, password } = req.body;
    if (!id || !password) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }    
    const result = await accountManager.findAccountWithPassword({
      id: id,
      password: password,
    });

    if (result instanceof APIError) {
      res.status(200).json(result);
      return;
    }

    const token = sessionManager.createSessionToken();
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_EXPIRED),
      // TODO : "domain : 'frontend domain'"
    });
    req.session.token = token;
    req.session.id = id;

    req.session.save((err) => {
      if (err) {
        res.status(200).json(new APIError(602, 'Session save failed'));
      }
      res.status(200).json(new APIResponse(0, {id: id}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(811, 'Account login failed'));
  }
  
});

router.get('/logout', async (req, res) => {
  try {
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    res.clearCookie('token');
    res.clearCookie('id');

    req.session.destroy((err) => {
      if (err) {
        res.status(200).json(new APIError(604, 'Session destroy failed'));
        return;
      }
      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(812, 'Account logout failed'));
  }
});

router.get('/refresh', async (req, res) => {
  try {
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    req.session.token = sessionManager.createSessionToken();
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        res.status(200).json(new APIError(605, 'Session refresh failed'));
        return;
      }
      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(813, 'Account refresh failed'));
  }
});

router.delete('/', async (req, res) => {
  try {
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    const { id, password } = req.body;
    if (!id || !password) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }
    
    if (req.session.id != id) {
      res.status(200).json(new APIError(801, "Permission denied"));
      return;
    }
    
    res.clearCookie('token');
    res.clearCookie('id');
    req.session.destroy(async (err) => {
      if(err){
        res.status(200).json(new APIError(604, 'Session destroy failed'));
        return;
      }
      const profileResult = await profileManager.deleteProfile({
        id: id,
      });
      if (profileResult instanceof APIError) {
        res.status(200).json(profileResult);
        return;
      }

      const accountResult = await accountManager.deleteAccount({
        id: id,
        password: password,
      });

      if (accountResult instanceof APIError) {
        res.status(200).json(accountResult);
        return;
      }

      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(814, 'Account withdraw failed'));
  }
});

router.put('/', async (req, res) => {
  try {
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    const { id, password, newPassword } = req.body;

    if (!id || !password || !newPassword) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    if (req.session.id != id){
      res.status(200).json(new APIError(801, "Permission denied"));
      return;
    }

    const result = await accountManager.updateAccountPassword({
      id: id,
      password: password,
      newPassword: newPassword,
    });
    if(result instanceof APIError){
      res.status(200).json(result);
      return;
    }
    res.status(200).json(new APIResponse(0, {}));
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(815, 'Account change password failed'));
  }
});

module.exports = router;