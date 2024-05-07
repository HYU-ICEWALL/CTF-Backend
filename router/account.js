const express = require('express');
const router = express.Router();
const { accountManager, sessionManager } = require('../instances');
const { APIResponse, APIError } = require('../modules/response');

router.post('/register', async (req, res) => {
  try {
    const { email, id, password } = req.body;
    if (!email || !id || !password) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    const result = await accountManager.createAccount(email, id, password);
    res.status(200).json(result);
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
    
    
    const result = await accountManager.findAccountWithPassword(id, password);
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

router.get('/logout', (req, res) => {
  try {
    if (!req.session || !req.session.token || !req.session.id) {
      res.status(200).json(new APIError(602, 'Session not found'));
      return;
    }

    if(req.cookies.token != req.session.token || req.cookies.id != req.session.id){
      res.status(200).json(new APIError(611, 'Cookie malformed'));
      return;
    }

    res.clearCookie('token');
    res.clearCookie('id');

    req.session.destroy((err) => {
      if (err) {
        res.status(200).json(new APIError(604, 'Session destroy failed'));
        return;
      }
      res.status(200).json(new APIResponse(0, null));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(812, 'Account logout failed'));
  }
});

router.get('/refresh', (req, res) => {
  try {
    if(!req.session || !req.session.token || !req.session.id){
      res.status(200).json(new APIError(602, 'Session not found'));
      return;
    }

    if(req.session.token != req.cookies.token || req.session.id != req.cookies.id){
      res.status(200).json(new APIError(611, 'Cookie malformed'));
      return;
    }
    
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        res.status(200).json(new APIError(605, 'Session refresh failed'));
        return;
      }
      res.status(200).json(new APIResponse(0, null));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(813, 'Account refresh failed'));
  }
});

router.delete('/', async (req, res) => {
  try {
    if(!req.session || !req.session.token || !req.session.id){
      res.status(200).json(new APIError(602, 'Session not found'));
      return;
    }
    if(req.session.token != req.cookies.token || req.session.id != req.cookies.id){
      res.status(200).json(new APIError(611, 'Cookie malformed'));
      return;
    }

    const { id, password } = req.body;
    if (!id || !password) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    const result = await accountManager.deleteAccount(id, password);
    if(result instanceof APIError){
      res.status(200).json(result);
      return;
    }
    
    req.session.destroy((err) => {
      if(err){
        res.status(200).json(new APIError(604, 'Session destroy failed'));
        return;
      }
      res.clearCookie('token');
      res.clearCookie('id');
      res.status(200).json(new APIResponse(0, null));
    });
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(814, 'Account withdraw failed'));
  }
});

router.put('/', async (req, res) => {
  try {
    if(!req.session || !req.session.token || !req.session.id){
      res.status(200).json(new APIError(602, 'Session not found'));
      return;
    }
    if(req.session.token != req.cookies.token || req.session.id != req.cookies.id){
      res.status(200).json(new APIError(611, 'Cookie malformed'));
      return;
    }

    const { id, password, newPassword } = req.body;

    if (!id || !password || !newPassword) {
      res.status(200).json(new APIError(800, 'Invalid parameters'));
      return;
    }

    const result = await accountManager.updateAccountPassword(id, password, newPassword);
    if(result instanceof APIError){
      res.status(200).json(result);
      return;
    }
    res.status(200).json(new APIResponse(0, null));
  } catch (error) {
    console.error(error);
    res.status(200).json(new APIError(815, 'Account change password failed'));
  }
});

module.exports = router;