const express = require('express');
const router = express.Router();
const { accountManager, sessionManager } = require('../instances');

router.post('/register', async (req, res) => {
  // TODO : 회원가입
  // 1. 이메일 or 전화번호 중복 체크
  try {
    const { email, id, password } = req.body;
    const account = await accountManager.findAccount(id, password);
    if(account !== undefined){
      console.log('Account already exists');
      res.status(400).send('Account already exists');
      return;
    }
    // 2. 회원가입
    const newAccount = await accountManager.createAccount(email, id, password);
    if(newAccount === undefined || newAccount === null){
      console.log('Failed to create account');
      throw new Error('Failed to create account');
    }

    console.log('Account created');
    res.status(200).send('Account created. Verify your email.');
  } catch (error) {
    res.status(500).send('Internal Server Error');
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
    if(!!req.session && !!req.session.account && accountManager.compareAccount(req.session.account, account) && !!req.session.token){
      console.log('Already logged in');
      res.status(403).send('Already logged in');
      return;
    }
    if (account == undefined) {
      console.log('Account not found');
      res.status(400).send('Account not found');
      return;
    }
    
    // 3. 토큰 확인 및 발급
    const token = sessionManager.createSessionToken();
    res.cookie('token', token, {
      httpOnly: true,
    });
    req.session.token = token;
    req.session.account = account;

    req.session.save((err) => {
      if (err) {
        console.log('Session save failed');
        throw new Error('Session save failed');
      }
      // 4. 로그인 완료
      console.log('Login success');
      res.status(200).send('Login success');
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
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
      res.status(400).send('Not logged in');
      return;
    }
    res.clearCookie('token');
    // 2. 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        console.log('Session destroy failed');
        res.status(400).send('Session destroy failed');
        return;
      }
      console.log('Session destroyed');
      // 3. 로그아웃 완료
      res.status(200).send('Logout success');
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

router.get('/refresh', (req, res) => {
  // TODO : 토큰 갱신
  // 1. 토큰 갱신
  try {
    if (!req.session || !req.session.token || !req.session.account) {
      console.log('Session Not found');
      res.status(400).send('Session Not found');
      return;
    }

    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(400).send('Token not matched');
      return;
    }
    
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        console.log('Session save failed');
        res.status(400).send('Session save failed');
        return;
      }
      // 2. 갱신 완료
      console.log('Session refresh success');
      res.status(200).send('Session refresh success');
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
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
    if(!req.session || !req.session.token || !req.session.account){
      console.log('Session not found');
      res.status(401).send('Unauthorized');
      return;
    }
    if(req.session.token != req.cookies.token){
      console.log('Token not matched');
      res.status(401).send('Unauthorized');
      return;
    }

    const { id, password } = req.body;
    let account = await accountManager.findAccount(id, password);

    if(accountManager.compareAccount(req.session.account, account) === false){
      console.log('Account not matched');
      res.status(401).send('Unauthorized');
      return;
    }

    account = await accountManager.deleteAccount(id, password);
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
      res.status(200).send('Withdraw success');
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
      res.status(400).send('Account not found or password not matched');
      return;
    }

    

    req.session.destroy((err) => {
      if(err){
        console.log('Session destroy failed');
        throw new Error('Session destroy failed');
      }
      // 2. 변경 완료
      console.log('Change password success');
      res.status(200).send('Change password success');
    })

  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});

router.get('/validate', (req, res) => {
  try {
    if(!req.cookies.token || !req.session || !req.session.token || !req.session.account){
      console.log('Session not found');
      res.status(401).send('Unauthorized');
      return;
    }

    if(req.cookies.token != req.session.token){
      console.log('Token not matched');
      res.status(401).send('Unauthorized');
      return;
    }

    console.log('Authorized');
    res.status(200).json(req.session.account);
  } catch (error) {
    console.log('Internal Server Error');
    res.status(500).send('Internal Server Error');
    console.error(error); 
  }
});

module.exports = router;