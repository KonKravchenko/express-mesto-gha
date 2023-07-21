/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Error = require('../errors/ErrorAPI');

const ERROR_BAD_REQUEST = 400;
const ERROR_UNAUTHORIZED = 401;
const ERROR_NOT_FOUND = 404;
const ERROR_CONFLICTING_REQUEST = 409;
const ERROR_INTERNAL_SERVER = 500;

const SALT_ROUNDS = 10;

const JWT_SECRET = 'somethingverysecret';

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error('Email и пароль не могут быть пустыми', ERROR_BAD_REQUEST);
  } else {
    User.findOne({ email }).select('+password')
      .then((user) => {
        bcrypt.compare(password, user.password, (err, isValidPassword) => {
          if (!isValidPassword) {
            throw new Error('Email и пароль не могут быть пустыми', ERROR_UNAUTHORIZED);
          } else {
            const token = jwt.sign({ id: user._id }, JWT_SECRET);
            res
              .cookie('jwt', token, {
                maxAge: 3600000 * 24 * 7,
                httpOnly: true,
                sameSite: true,
              })
              .send({ id: user._id });
          }
        });
      })
      .catch((error) => {
        throw new Error('Произошла ошибка авторизации', ERROR_BAD_REQUEST);
      })
      .catch(next);
  }
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) {
    throw new Error('Email и пароль не могут быть пустыми', ERROR_BAD_REQUEST);
  } else {
    const validEmail = validator.isEmail(email);
    bcrypt.hash(password, SALT_ROUNDS, (error, hash) => {
      User.findOne({ email })
        .then((user) => {
          if (user) {
            throw new Error('Пользователь с таким Email уже зарегестрирован', ERROR_CONFLICTING_REQUEST);
          } else if (validEmail === true) {
            User.create({
              name, about, avatar, email, password: hash,
            })
              .then((data) => {
                res
                  .status(201)
                  .send({
                    name, about, avatar, email,
                  });
              })
              .catch((err) => {
                if (err instanceof mongoose.Error.ValidationError) {
                  throw new Error('Переданы некорректные данные', ERROR_BAD_REQUEST);
                } else {
                  throw new Error('Ошибка сервера', ERROR_INTERNAL_SERVER);
                }
              });
          } else if (validEmail === false) {
            throw new Error('Неверные email или пароль', ERROR_BAD_REQUEST);
          }
        })
        // .catch((err) => {
        //   throw new Error('Произошла ошибка', ERROR_BAD_REQUEST);
        // })
        .catch(next);
    });
  }
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res
        .status(200)
        .send(users);
    })
    .catch(() => {
      throw new Error('Ошибка сервера', ERROR_INTERNAL_SERVER);
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new Error('Пользователь не найден', ERROR_NOT_FOUND);
      } else if (err.name === 'CastError') {
        throw new Error('Переданы некорректные данные', ERROR_BAD_REQUEST);
      } else {
        throw new Error('Ошибка сервера', ERROR_INTERNAL_SERVER);
      }
    })
    .catch(next);
};

const getAuthUser = (req, res, next) => {
  const { id } = req.user;
  User.findById(id)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new Error('Пользователь не найден', ERROR_NOT_FOUND);
      } else if (err.name === 'CastError') {
        throw new Error('Переданы некорректные данные', ERROR_BAD_REQUEST);
      } else {
        throw new Error('Ошибка сервера', ERROR_INTERNAL_SERVER);
      }
    })
    .catch(next);
};

const changeProfileData = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user.id,
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
        throw new Error('Пользователь не найден', ERROR_NOT_FOUND);
      } else if (err.message === 'NotValidId') {
        throw new Error('Переданы некорректные данные', ERROR_BAD_REQUEST);
      } else {
        throw new Error('Ошибка сервера', ERROR_INTERNAL_SERVER);
      }
    })
    .catch(next);
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
