/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { errors } = require('celebrate');


// const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');

const app = express();

const router = require('./routes');


mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());



// app.use(auth);
app.use('/', router);


// обработчики ошибок
app.use(errors()); // обработчик ошибок celebrate

app.use(errorHandler);

app.listen(3000, () => {
  console.log('Сервер запущен!');
});
