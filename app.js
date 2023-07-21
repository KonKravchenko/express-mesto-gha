const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const auth = require('./middlewares/auth');

const app = express();

const router = require('./routes');
const {
  login, createUser,
} = require('./controllers/users');

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());

app.post('/signup', createUser);
app.post('/signin', login);

app.use(auth);
app.use('/', router);

app.listen(3000, () => {
  console.log('Сервер запущен!');
});
