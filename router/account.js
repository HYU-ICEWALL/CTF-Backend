require('dotenv').config(); 
const express = require('express');
const router = express.Router();
const { accountManager, sessionManager, profileManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');

router.post('/', async (req, res) => {
  try {
    // check session exist
    if (!!req.session && !!req.session.id && !!req.session.token) {
      res.status(200).json(new APIError(601, 'Session found'));
      return;
    }

    // check parameter
    const { email, id, password, name, organization, department } = req.body;
    if (!email || !id || !password || !name || !organization || !department) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    // create account
    const accountResult = await accountManager.createAccount({
      email: email,
      id: id,
      password: password,
      authority: 0,
    }, process.env.SALT_SIZE);

    if (accountResult instanceof APIError) {
      res.status(200).json(accountResult);
      return;
    }


    // create profile
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
    // check session exist
    if(!!req.session && !!req.session.id && !!req.session.token)
    {
      res.status(200).json(new APIError(601, 'Session found'));
      return;
    }

    // check parameter
    const { id, password } = req.body;
    if (!id || !password) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }    

    // find account with password
    const result = await accountManager.findAccountWithPassword({
      id: id,
      password: password,
    });

    if (result instanceof APIError) {
      res.status(200).json(result);
      return;
    }

    // create session
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
    // check session valid
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    // clear session
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
    // check session valid
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    // refresh session
    req.session.token = sessionManager.createSessionToken();
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        res.status(200).json(new APIError(605, 'Session refresh failed'));
        return;
      }
      res.cookie('token', req.session.token);
      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(813, 'Account refresh failed'));
  }
});

router.delete('/', async (req, res) => {
  try {
    // check session valid
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    // check parameter
    const { id, password } = req.body;
    if (!id || !password) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }
    
    // check permission
    const permissionResult = await accountManager.checkAuthority(req);
    if (permissionResult instanceof APIError) {
      res.status(200).json(permissionResult);
      return;
    }
    
    // delete session
    req.session.destroy(async (err) => {
      if(err){
        res.status(200).json(new APIError(604, 'Session destroy failed'));
        return;
      }
      res.clearCookie('token');
      res.clearCookie('id');

      // delete profile
      const profileResult = await profileManager.deleteProfiles({
        id: id,
      });
      if (profileResult instanceof APIError) {
        res.status(200).json(profileResult);
        return;
      }

      // delete account
      const accountResult = await accountManager.deleteAccounts({
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
    // check session valid
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    // check parameter
    const { id, password, newPassword } = req.body;
    if (!id || !password || !newPassword) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    // check permission
    const permissionResult = await accountManager.checkAuthority(req);
    if (permissionResult instanceof APIError) {
      res.status(200).json(permissionResult);
      return;
    }

    // delete session
    req.session.destroy(async (err) => {
      if (err) {
        res.status(200).json(new APIError(604, 'Session destroy failed'));
        return;
      }
      res.clearCookie('token');
      res.clearCookie('id');
      
      // update account password
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
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(815, 'Account change password failed'));
  }
});

module.exports = router;