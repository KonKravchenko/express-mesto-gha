/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');

const ERROR_BAD_REQUEST = 400;
const ERROR_NOT_FOUND = 404;
const ERROR_INTERNAL_SERVER = 500;

const JWT_SECRET = 'somethingverysecret';

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) { return res.status(ERROR_BAD_REQUEST).send({ message: 'Email и пароль не могут быть пустыми' }); }

  return User.findOne({ email })
    .then((user) => {
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ id: user._id });
    })
    .catch((error) => { res.status(401).send({ message: 'Произошла ошибка авторизации' }); });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) { res.status(ERROR_BAD_REQUEST).send({ message: 'Email и пароль не могут быть пустыми' }); }
  else {
    const validEmail = validator.isEmail(email);
    User.findOne({ email })
      .then((user) => {
        if (user) { res.status(409).send({ message: 'Пользователь с таким Email уже зарегестрирован' }); }

        else if (validEmail === true) {
          User.create({
            name, about, avatar, email, password,
          })
            .then((user) => {
              res
                .status(201)
                .send(user);
            })
            .catch((error) => {
              if (error instanceof mongoose.Error.ValidationError) {
                res
                  .status(ERROR_BAD_REQUEST)
                  .send({ message: 'Переданы некорректные данные' });
              } else {
                res
                  .status(ERROR_INTERNAL_SERVER)
                  .send({ message: 'Ошибка сервера' });
              }
            });
        } else if (validEmail === false) {
          res
            .status(ERROR_BAD_REQUEST)
            .send({ message: 'Неверные email или пароль' });
        }
      })
      .catch((error) => { res.status(400).send({ message: 'Произошла ошибка' }); });
  }
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res
        .status(200)
        .send(users);
    })
    .catch(() => {
      res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'Ошибка сервера' });
    });
};

const getUser = (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Пользователь не найден' });
      } else if (err.name === 'CastError') {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
      } else {
        res
          .status(ERROR_INTERNAL_SERVER)
          .send({ message: 'Ошибка сервера' });
      }
    });
};

const getAuthUser = (req, res) => {
  const { id } = req.user;
  User.findById(id)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Пользователь не найден' });
      } else if (err.name === 'CastError') {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
      } else {
        res
          .status(ERROR_INTERNAL_SERVER)
          .send({ message: 'Ошибка сервера' });
      }
    });
};

const changeProfileData = (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res
        .status(200)
        .send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotValidId') {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Пользователь не найден' });
      } else {
        res
          .status(ERROR_INTERNAL_SERVER)
          .send({ message: 'Ошибка сервера' });
      }
    });
};

const changeProfileNameAbout = (req, res) => {
  changeProfileData(req, res);
};

const changeProfileAvatar = (req, res) => {
  changeProfileData(req, res);
};

module.exports = {
  login,
  createUser,
  getUsers,
  getUser,
  changeProfileNameAbout,
  changeProfileAvatar,
  getAuthUser,
};
