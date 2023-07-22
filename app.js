/* eslint-disable */
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
// const ErrorAPI = require('./errors/ErrorAPI');


const auth = require('./middlewares/auth');

const app = express();

const router = require('./routes');
const {
  login, createUser,
} = require('./controllers/users');

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  })
    .unknown(true),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  })
    .unknown(true),
}), login);

app.use(auth);
app.use('/', router);


// обработчики ошибок
app.use(errors()); // обработчик ошибок celebrate

app.use((err, req, res, next) => {
  console.log(err)
  res
    .status(err.statusCode)
    .send({ message: errors.message });
});

app.listen(3000, () => {
  console.log('Сервер запущен!');
});
