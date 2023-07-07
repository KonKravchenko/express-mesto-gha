const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const ERROR_NOT_FOUND = 404;
const router = require('./routes');

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());
app.use((req, res, next) => {
  req.user = {
    _id: '64a3216c033e3ab096a58965',
  };

  next();
});

app.use('/', router);
app.use('*', (req, res) => {
  res
    .status(ERROR_NOT_FOUND)
    .send({ message: 'Неверный путь' });
});

app.listen(3000, () => {
  console.log('Сервер запущен!');
});
