require('dotenv').config();
const { accountManager, profileManager, sessionManager, timeManager, run } = require('./instances');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT;

const accountRouter = require('./router/account');
const profileRouter = require('./router/profile');
const contestRouter = require('./router/contest');
const problemRouter = require('./router/problem');
const adminRouter = require('./router/admin');

const { APIResponse } = require('./modules/response');

app.set('trust proxy', true);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(sessionManager.session);

app.set('view engine', 'ejs');
app.set('views', './views');

app.use((req, res, next) => {  
  const time = timeManager.timestamp();
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).toString().replace('::ffff:', '');
  const protocol = req.protocol;
  const method = req.method;
  const path = req.path;
  const query = req.query;
  const body = req.body;
  const session = req.session;

  if (method == 'GET') {
    console.log(`[${time}] ${protocol} ${ip} ${method} ${path} ${JSON.stringify(query)} ${JSON.stringify(session)}`);
  }else{
    console.log(`[${time}] ${protocol} ${ip} ${method} ${path} ${JSON.stringify(body)} ${JSON.stringify(session)}`);
  }

  next();
});

app.use('/api/account', accountRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contest', contestRouter);
app.use('/api/problem', problemRouter);
app.use('/admin', adminRouter);


app.use((req, res) => {
  res.status(404).json(new APIResponse(-1, 'Page Not Found'));
});

app.listen(port, '0.0.0.0', async () => {
  console.log(`Auth Server listening on port ${port}`);
  await run();

  const accountResult = await accountManager.findAccountByPassword({
    id: process.env.ADMIN_ID,
    password: process.env.ADMIN_PASSWORD
  });
  if(accountResult.code == 0){
    console.log('Admin account already exists');
  }else{
    // create admin account
    const accountResult = await accountManager.createAccount({
      email: process.env.ADMIN_EMAIL,
      id: process.env.ADMIN_ID,
      password: process.env.ADMIN_PASSWORD,
      authority: 1
    }, process.env.SALT_SIZE);

    if (accountResult.code == 0) {
      console.log('Admin account created');
    } else {
      console.log(accountResult);
    }
    
  }

  const profileResult = await profileManager.findProfiles({
    id: process.env.ADMIN_ID
  });

  if(profileResult.data.length > 0){
    console.log('Admin profile already exists');
  }
  else{
    const profileResult = await profileManager.createProfile({
      id: process.env.ADMIN_ID,
      email: process.env.ADMIN_EMAIL,
      name: process.env.ADMIN_NAME,
      organization: process.env.ADMIN_ORGANIZATION,
      department: process.env.ADMIN_DEPARTMENT,
    });

    if (profileResult.code == 0) {
      console.log('Admin profile created');
    } else {
      console.log(profileResult);
    }
  }
});
