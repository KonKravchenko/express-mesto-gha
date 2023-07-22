/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');

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

// обработчики ошибок
// app.use(errors()); // обработчик ошибок celebrate

// наш централизованный обработчик
app.use((err, req, res, next) => {
  console.log(err.statusCode, { message: err.message })
  // if([400,401,403,409,500].includes(err.statusCode)){
  // res
  //   .status(err.statusCode)
  //   .send({ message: err.message });
  // } else {
  //   next(err)
  // }
  res
    .status(err.statusCode)
    .send({ message: err.message });

  // const { statusCode = 500, message } = err;

  // res
  //   .status(statusCode)
  //   .send({
  //     // проверяем статус и выставляем сообщение в зависимости от него
  //     message: statusCode === 500
  //       ? 'На сервере произошла ошибка'
  //       : message
  //   });
});

app.listen(3000, () => {
  console.log('Сервер запущен!');
});
