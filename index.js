require('dotenv').config();
const { sessionManager, run } = require('./instances');
const express = require('express');
const app = express();
const port = process.env.PORT;

const cookieParser = require('cookie-parser');
const accountRouter = require('./router/account');
const profileRouter = require('./router/profile');
const contestRouter = require('./router/contest');
const problemRouter = require('./router/problem');
const adminRouter = require('./router/admin');

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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, async () => {
  console.log(`Auth Server listening on port ${port}`);
  await run();
});