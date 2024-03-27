require('dotenv').config();
const { sessionManager, run } = require('./instances');
const express = require('express');
const app = express();
const port = process.env.PORT;

const cookieParser = require('cookie-parser');
const accountRouter = require('./router/account');

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionManager.session);


app.use('/api/account', accountRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, async () => {
  console.log(`Auth Server listening on port ${port}`);
  await run();
});