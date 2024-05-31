require('dotenv').config();
const express = require('express');
const router = express.Router();
const { accountManager, sessionManager, profileManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');

router.post('/', async (req, res) => {
  try {
    console.log("Session Check");
    // check session exist
    if (!!req.session && !!req.session.data && !!req.session.data.id && !!req.session.data.token) {
      res.status(200).json(new APIError(101, 'Session already exist'));
      return;
    }
    
    // check parameter
    const { email, id, password, name, organization, department } = req.body;
    if (!email || !id || !password || !name || !organization || !department) {
      res.status(200).json(new APIError(102, 'Invalid parameters'));
      return;
    }

    const accountId = await accountManager.findAccounts({ id: id });
    if (accountId instanceof APIError) {
      res.status(200).json(accountId);
      return;
    }

    if(accountId.data.length > 0){
      res.status(200).json(new APIError(103, 'ID already exists'));
      return;
    }

    const accountEmail = await accountManager.findAccounts({ email: email });
    if(accountEmail instanceof APIError){
      res.status(200).json(accountEmail);
      return;
    }
    
    if(accountEmail.data.length > 0){
      res.status(200).json(new APIError(104, 'Email already exists'));
      return;
    }

    console.log("Create account : " + id);
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

    console.log("Create profile : " + id);
    // create profile
    const profileResult = await profileManager.createProfile({
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

    res.status(200).json(new APIResponse(0, {}));
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(100, 'Account registeration failed'));
  }
});

router.post('/login', async (req, res) => {
  try {
    // check parameter
    const { id, password } = req.body;
    if (!id || !password) {
      res.status(200).json(new APIError(111, 'Invalid parameters'));
      return;
    }

    console.log("Find account : " + id);
    // find account with password
    const result = await accountManager.findAccountByPassword({
      id: id,
      password: password,
    });

    if (result instanceof APIError) {
      res.status(200).json(result);
      return;
    }

    console.log("Create session : " + id);
    // create session
    const token = sessionManager.createSessionToken();

    req.session.data = JSON.stringify({
      id: id,
      token: token,
    });

    req.session.save((err) => {
      if (err) {
        res.status(200).json(new APIError(112, 'Session save failed'));
        return;
      }
      console.log("Session created : " + req.session.data);
      return res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(110, 'Account login failed'));
  }

});

router.get('/auth', async (req, res) => {
  try {
    console.log("Auth Session : " + req.session.data);
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }
    res.status(200).json(new APIResponse(0, {}));
  } catch (err) {
    console.error(err);
    res.status(200).json(new APIError(120, 'Account auth failed'));
  }
})

router.get('/logout', async (req, res) => {
  try {
    // check session valid
    const sessionResult = await sessionManager.checkValidSession(req);
    if (sessionResult instanceof APIError) {
      res.status(200).json(sessionResult);
      return;
    }

    console.log("Delete Session : " + req.session.data);
    req.session.destroy((err) => {
      if (err) {
        res.status(200).json(new APIError(131, 'Session destroy failed'));
        return;
      }
      res.clearCookie(process.env.SESSION_NAME);
      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(130, 'Account logout failed'));
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
    console.log("Refresh Session : " + req.session.data.id);
    const token = sessionManager.createSessionToken();
    req.session.data.token = token;
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        res.status(200).json(new APIError(141, 'Session refresh failed'));
        return;
      }
      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(140, 'Account refresh failed'));
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
      res.status(200).json(new APIError(151, 'Invalid parameters'));
      return;
    }

    const data = JSON.parse(req.session.data);
    console.log("Check permission : " + id + " " + data.id);
    // check permission
    if(id != data.id){
      return res.status(200).json(new APIError(152, 'Not allowed'));
    }

    console.log("Delete Account : " + id);
    // delete session
    req.session.destroy(async (err) => {
      if (err) {
        res.status(200).json(new APIError(153, 'Session destroy failed'));
        return;
      }

      // delete profile
      console.log("Delete Profile : " + id);
      const profileResult = await profileManager.deleteProfiles({
        id: id,
      });
      if (profileResult instanceof APIError) {
        res.status(200).json(profileResult);
        return;
      }

      console.log("Delete Account : " + id);
      const account = await accountManager.findAccountByPassword({ id: id, password: password });
      if (account instanceof APIError) {
        res.status(200).json(account);
        return;
      }

      // delete account
      const accountResult = await accountManager.deleteAccounts({
        id: id,
      });

      if (accountResult instanceof APIError) {
        res.status(200).json(accountResult);
        return;
      }

      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(150, 'Account deletion failed'));
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
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      res.status(200).json(new APIError(161, 'Invalid parameters'));
      return;
    }

    const data = JSON.parse(req.session.data);

    const account = await accountManager.findAccountByPassword({ id: data.id, password: password });
    if (account instanceof APIError) {
      res.status(200).json(account);
      return;
    }

    if (!account.data){
      res.status(200).json(new APIError(162, 'Password incorrect'));
      return;
    }

    console.log("Delete Session : " + data.id);
    req.session.destroy(async (err) => {
      if (err) {
        res.status(200).json(new APIError(163, 'Session destroy failed'));
        return;
      }
      // update account password
      const result = await accountManager.updateAccountPassword({
        id: id,
        password: password,
        newPassword: newPassword,
      });
      if (result instanceof APIError) {
        res.status(200).json(result);
        return;
      }
      res.status(200).json(new APIResponse(0, {}));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(160, 'Account password change failed'));
  }
});

module.exports = router;