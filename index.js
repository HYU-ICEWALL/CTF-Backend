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
const { APIResponse } = require('./modules/response');

app.use(cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionManager.session);

app.use('/api/account', accountRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contest', contestRouter);
app.use('/api/problem', problemRouter);

app.use((req, res) => {
  res.status(404).json(APIResponse(404, 'Not Found', null));
});

app.listen(port, async () => {
  console.log(`Auth Server listening on port ${port}`);
  await run();
});