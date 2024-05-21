require('dotenv').config();
const { sessionManager, run } = require('./instances');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT;

const cookieParser = require('cookie-parser');
const accountRouter = require('./router/account');
const profileRouter = require('./router/profile');
const contestRouter = require('./router/contest');
const problemRouter = require('./router/problem');
const adminRouter = require('./router/admin');

const { APIResponse } = require('./modules/response');

app.use(cors({
  origin: true,
  credentials:true,
}));

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionManager.session);

app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/api/account', accountRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contest', contestRouter);
app.use('/api/problem', problemRouter);
app.use('/admin', adminRouter);


app.use((req, res) => {
  res.status(404).json(new APIResponse(-1, 'Page Not Found'));
});

app.listen(port, async () => {
  console.log(`Auth Server listening on port ${port}`);
  await run();

  // create admin account
  const { accountManager, profileManager } = require('./instances');
  const accountResult = await accountManager.createAccount({
    email: process.env.ADMIN_EMAIL,
    id: process.env.ADMIN_ID,
    password: process.env.ADMIN_PASSWORD,
    authority: 1
  }, process.env.SALT_SIZE);

  if (accountResult.code == 0) {
    console.log('Admin account created');
  }else{
    console.log(accountResult);
  }


  const profileResult = await profileManager.createProfile({
    id: process.env.ADMIN_ID,
    email: process.env.ADMIN_EMAIL,
    name: process.env.ADMIN_NAME,
    organization: process.env.ADMIN_ORGANIZATION,
    department: process.env.ADMIN_DEPARTMENT,
  });

  if (profileResult.code == 0) {
    console.log('Admin profile created');
  }else{
    console.log(profileResult);
  }
});
