import express from 'express';
import session from 'express-session';
import login from './login.js';

const app = express();

app.use(
  session({
    secret: 'concert_ticket_selling',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

app.use('/auth', login);

app.get('/', (req, res) => {
  if (req.session.logged) {
    res.redirect('/index.html');
  } else {
    res.redirect('/login.html');
  }
});

app.use('/', express.static('static'));

const port = 8080;
app.listen(port, () => {
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Hong_Kong',
  });
  console.log(`${currentDate}`);
  console.log(`Server started at http://127.0.0.1:${port}`);
});
