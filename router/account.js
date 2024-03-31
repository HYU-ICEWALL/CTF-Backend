const express = require('express');
const router = express.Router();
const { accountManager, sessionManager } = require('../instances');

router.post('/register', async (req, res) => {
  // TODO : 회원가입
  // 1. 이메일 or 전화번호 중복 체크
  try {
    const { email, id, password } = req.body;
    if((await accountManager.findAccountExist(id, password)) == {}){
      res.status(400).send('Account already exists');
      return;
    }
    // 2. 회원가입
    const account = await accountManager.createAccount(email, id, password);
    if(account == undefined){
      throw new Error('Failed to create account');
    }

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
    const account = await accountManager.findAccountExist(id, password);
    if (account == undefined) {
      res.status(400).send('Account not found');
      return;
    }

    if(!!req.session && req.session.uuid === account.uuid && !!req.session.token){
      console.log(req.session.token);
      res.status(403).send('Already logged in');
      return;
    }

    // 3. 토큰 확인 및 발급
    const [uuid, token] = sessionManager.createSession(account.uuid);

    req.session.uuid = uuid;
    req.session.token = token;

    req.session.save((err) => {
      if (err) {
        throw new Error('Session save failed');
      }
      // 4. 로그인 완료
      res.status(200).send('Login success');
      console.log(req.session);
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
  
});

router.post('/logout', (req, res) => {
  // TODO : 로그아웃
  // 1. 토큰 삭제
  try {
    const token = req.session.token;
    if (!token) {
      res.status(400).send('Not logged in');
      return;
    }

    // 2. 세션 삭제
    req.session.destroy((err) => {
      if (err) {
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

router.post('/refresh', (req, res) => {
  // TODO : 토큰 갱신
  // 1. 토큰 갱신
  try {
    if (!req.session || !req.session.token || !req.session.uuid) {
      res.status(400).send('Not logged in');
      return;
    }
    
    req.session.touch();
    req.session.save((err) => {
      if (err) {
        res.status(400).send('Session save failed');
        return;
      }
      // 2. 갱신 완료
      res.status(200).send('Token refresh success');
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
    const { id, password } = req.body;
    const account = await accountManager.deleteAccount(id, password);
    if (account == undefined) {
      res.status(400).send('Account not found');
      return;
    }

    req.session.destroy((err) => {
      if(err){
        throw new Error('Session destroy failed');
      }
      // 2. 탈퇴 완료
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
      res.status(400).send('Account not found');
      return;
    }
    req.session.destroy((err) => {
      if(err){
        throw new Error('Session destroy failed');
      }
      // 2. 변경 완료
      res.status(200).send('Change password success');
    })

  } catch (error) {
    res.status(500).send('Internal Server Error');
    console.error(error);
  }
});


module.exports = router;