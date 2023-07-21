/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const ErrorAPI = require('../errors/ErrorAPI');

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
    throw new ErrorAPI('Email и пароль не могут быть пустыми', ERROR_BAD_REQUEST);
  } else {
    User.findOne({ email }).select('+password')
      .then((user) => {
        bcrypt.compare(password, user.password, (err, isValidPassword) => {
          if (!isValidPassword) {
            // res
            //   .status(401)
            //   .send({ message: 'Неверный имя пользователя или пароль' });
            throw new ErrorAPI('Email и пароль не могут быть пустыми', ERROR_UNAUTHORIZED);
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
        // res
        //   .status(ERROR_BAD_REQUEST)
        //   .send({ message: 'Произошла ошибка авторизации' });
        throw new ErrorAPI('Произошла ошибка авторизации', ERROR_BAD_REQUEST);
      })
      .catch(next);
  }
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) {
    // res
    //   .status(ERROR_BAD_REQUEST)
    //   .send({ message: 'Email и пароль не могут быть пустыми' });
    throw new ErrorAPI('Email и пароль не могут быть пустыми', ERROR_BAD_REQUEST);
  } else {
    const validEmail = validator.isEmail(email);
    bcrypt.hash(password, SALT_ROUNDS, (error, hash) => {
      User.findOne({ email })
        .then((user) => {
          if (user) {
            // res
            //   .status(409)
            //   .send({ message: 'Пользователь с таким Email уже зарегестрирован' });
            throw new ErrorAPI('Пользователь с таким Email уже зарегестрирован', ERROR_CONFLICTING_REQUEST);
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
                  // res
                  //   .status(ERROR_BAD_REQUEST)
                  //   .send({ message: 'Переданы некорректные данные' });
                  throw new ErrorAPI('Переданы некорректные данные', ERROR_BAD_REQUEST);
                } else {
                  // res
                  //   .status(ERROR_INTERNAL_SERVER)
                  //   .send({ message: 'Ошибка сервера' });
                  throw new ErrorAPI('Ошибка сервера', ERROR_INTERNAL_SERVER);
                }
              })
              .catch(next);
          } else if (validEmail === false) {
            // res
            //   .status(ERROR_BAD_REQUEST)
            //   .send({ message: 'Неверные email или пароль' });
            throw new ErrorAPI('Неверные email или пароль', ERROR_BAD_REQUEST);
          }
        })
        .catch((err) => {
          // res
          //   .status(400)
          //   .send({ message: 'Произошла ошибка' });
          throw new ErrorAPI('Произошла ошибка', ERROR_BAD_REQUEST);
        })
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
      // res
      //   .status(ERROR_INTERNAL_SERVER)
      //   .send({ message: 'Ошибка сервера' });
      throw new ErrorAPI('Ошибка сервера', ERROR_INTERNAL_SERVER);
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
        // res
        //   .status(ERROR_NOT_FOUND)
        //   .send({ message: 'Пользователь не найден' });
        throw new ErrorAPI('Пользователь не найден', ERROR_NOT_FOUND);
      } else if (err.name === 'CastError') {
        // res
        //   .status(ERROR_BAD_REQUEST)
        //   .send({ message: 'Переданы некорректные данные' });
        throw new ErrorAPI('Переданы некорректные данные', ERROR_BAD_REQUEST);
      } else {
        // res
        //   .status(ERROR_INTERNAL_SERVER)
        //   .send({ message: 'Ошибка сервера' });
        throw new ErrorAPI('Ошибка сервера', ERROR_INTERNAL_SERVER);
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
        // res
        //   .status(ERROR_NOT_FOUND)
        //   .send({ message: 'Пользователь не найден' });
        throw new ErrorAPI('Пользователь не найден', ERROR_NOT_FOUND);
      } else if (err.name === 'CastError') {
        // res
        //   .status(ERROR_BAD_REQUEST)
        //   .send({ message: 'Переданы некорректные данные' });
        throw new ErrorAPI('Переданы некорректные данные', ERROR_BAD_REQUEST);
      } else {
        // res
        //   .status(ERROR_INTERNAL_SERVER)
        //   .send({ message: 'Ошибка сервера' });
        throw new ErrorAPI('Ошибка сервера', ERROR_INTERNAL_SERVER);
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
        // res
        //   .status(ERROR_BAD_REQUEST)
        //   .send({ message: 'Переданы некорректные данные' });
        throw new ErrorAPI('Переданы некорректные данные', ERROR_BAD_REQUEST);
      } else if (err.message === 'NotValidId') {
        // res
        //   .status(ERROR_NOT_FOUND)
        //   .send({ message: 'Пользователь не найден' });
        throw new ErrorAPI('Пользователь не найден', ERROR_NOT_FOUND);
      } else {
        // res
        //   .status(ERROR_INTERNAL_SERVER)
        //   .send({ message: 'Ошибка сервера' });
        throw new ErrorAPI('Ошибка сервера', ERROR_INTERNAL_SERVER);
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
