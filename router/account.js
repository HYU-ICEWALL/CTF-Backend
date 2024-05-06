const express = require('express');
const router = express.Router();
const { accountManager, sessionManager } = require('../instances');
const { APIResponse } = require('../modules/response');

router.post('/register', async (req, res) => {
  // TODO : 회원가입
  // 1. 이메일 or 전화번호 중복 체크
  try {
    const { email, id, password } = req.body;
    const account = await accountManager.findAccount(id, password);
    if(account !== undefined){
      console.log('Account already exists');
      res.status(400).json(APIResponse(400, 'Account already exists', null));
      return;
    }
    // 2. 회원가입
    const newAccount = await accountManager.createAccount(email, id, password);
    if(newAccount === undefined || newAccount === null){
      console.log('Failed to create account');
      throw new Error('Failed to create account');
    }

    console.log('Account created');
    res.status(200).json(APIResponse(200, 'Account created', {id: newAccount.id}));
  } catch (error) {
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

router.post('/login', async (req, res) => {
  // TODO : 로그인
  // 1. 이메일 or 전화번호 체크
  // 2. 비밀번호 확인
  try {
    
    const { id, password } = req.body;
    const account = await accountManager.findAccount(id, password);
    if (account == undefined) {
      console.log('Account not found');
      res.status(400).json(APIResponse(400, 'Account not found', null));
      return;
    }
    
    if(!!req.session && !!req.session.id && !!req.session.token && req.session.token == req.cookies.token){
      console.log('Already logged in');
      res.status(400).json(APIResponse(400, 'Already logged in', null));
      return;
    }
    
    // 3. 토큰 확인 및 발급
    const token = sessionManager.createSessionToken();
    res.cookie('token', token, {
      httpOnly: true,
    });
    req.session.token = token;
    req.session.id = account.id;

    req.session.save((err) => {
      if (err) {
        console.log('Session save failed');
        throw new Error('Session save failed');
      }
      // 4. 로그인 완료
      console.log('Login success');
      res.status(200).json(APIResponse(200, 'Login success', {id: account.id}));
    });
  } catch (error) {
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
  
});

router.get('/logout', (req, res) => {
  // TODO : 로그아웃
  // 1. 토큰 삭제
  try {
    const token = req.session.token;
    if (!token) {
      console.log('Not logged in');
      res.status(400).json(APIResponse(400, 'Not logged in', null));
      return;
    }
    res.clearCookie('token');
    // 2. 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        console.log('Session destroy failed');
        res.status(400).json(APIResponse(400, 'Session destroy failed', null));
        return;
      }
      console.log('Session destroyed');
      // 3. 로그아웃 완료
      res.status(200).json(APIResponse(200, 'Logout success', null));
    });
  } catch (error) {
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

router.get('/refresh', (req, res) => {
  // TODO : 토큰 갱신
  // 1. 토큰 갱신
  try {
    if (!req.session || !req.session.token || !req.session.id) {
      console.log('Session Not found');
      res.status(400).json(APIResponse(400, 'Session Not found', null));
      return;
    }

    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Token not matched', null));
      return;
    }
    
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        console.log('Session save failed');
        res.status(400).json(APIResponse(400, 'Session save failed', null));
        return;
      }
      // 2. 갱신 완료
      console.log('Session refresh success');
      res.status(200).json(APIResponse(200, 'Session refresh success', null));
    });
  } catch (error) {
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

router.post('/verify', (req, res) => {
  // TODO : 이메일 or 전화번호 인증
  // 1. 이메일 or 전화번호 인증
  // 2. 인증 완료
  res.send('not implemented');
});

router.post('/withdraw', async (req, res) => {
  // TODO : 회원 탈퇴
  // 1. 회원 탈퇴
  try {
    if(!req.session || !req.session.token || !req.session.id){
      console.log('Session not found');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }
    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    const { id, password } = req.body;
    const account = await accountManager.deleteAccount(id, password);
    if (account === undefined) {
      console.log('Failed to delete account');
      throw new Error('Failed to delete account');
    }

    req.session.destroy((err) => {
      if(err){
        console.log('Session destroy failed');
        throw new Error('Session destroy failed');
      }
      // 2. 탈퇴 완료
      console.log('Withdraw success');
      res.status(200).json(APIResponse(200, 'Withdraw success', null));
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

router.post('/change-password', async (req, res) => {
  // TODO : 비밀번호 변경
  try {
    // 1. 비밀번호 변경
    const {id, password, newPassword} = req.body;

    const account = await accountManager.changePassword(id, password, newPassword);
    if(account == undefined){
      console.log('Account not found or password not matched');
      res.status(400).json(APIResponse(400, 'Account not found or password not matched', null));
      return;
    }

    

    req.session.destroy((err) => {
      if(err){
        console.log('Session destroy failed');
        throw new Error('Session destroy failed');
      }
      // 2. 변경 완료
      console.log('Change password success');
      res.status(200).json(APIResponse(200, 'Change password success', null));
    })

  } catch (error) {
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error);
  }
});

router.get('/validate', (req, res) => {
  try {
    if(!req.cookies.token || !req.session || !req.session.token || !req.session.id){
      console.log('Session not found');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    if(req.cookies.token != req.session.token){
      console.log('Token not matched');
      res.status(401).json(APIResponse(401, 'Unauthorized', null));
      return;
    }

    console.log('Authorized');
    res.status(200).json(APIResponse(200, 'Authorized', {id: req.session.id}));
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).json(APIResponse(500, 'Internal Server Error', null));
    console.error(error); 
  }
});

module.exports = router;