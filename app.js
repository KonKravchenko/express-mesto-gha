const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const ERROR_NOT_FOUND = 404;

const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());
app.use((req, res, next) => {
  req.user = {
    _id: '64a3216c033e3ab096a58965', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);
app.use('*', (req, res) => {
  res
    .status(ERROR_NOT_FOUND)
    .send({ message: 'Неверный путь' });
});

app.listen(3000, () => {
  console.log('Сервер запущен!');
});
