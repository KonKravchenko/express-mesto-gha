/* eslint-disable no-unused-vars */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorized-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictingRequestError = require('../errors/conflicting-request-err');

const SALT_ROUNDS = 10;

const JWT_SECRET = 'somethingverysecret';

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      bcrypt.compare(password, user.password, (err, isValidPassword) => {
        if (!isValidPassword) {
          throw new UnauthorizedError('Неверный имя пользователя или пароль');
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
      throw new UnauthorizedError('Неверный имя пользователя или пароль');
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS, (error, hash) => {
    // User.findOne({ email })
    //   .then((user) => {
    if (error.code === 11000) {
      throw new ConflictingRequestError('Пользователь с таким Email уже зарегестрирован');
    }
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
      .catch(next);
    // })
    // .catch(next);
  });
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res
        .status(200)
        .send(users);
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
        throw new NotFoundError('Пользователь не найден');
      }
    })
    .catch(next);
};

const getAuthUser = (req, res, next) => {
  const { id } = req.user;
  User.findById(id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch(next);
};

const changeProfileData = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user.id,
    req.body,
    {
      new: true,
    },
  )
    .then((user) => {
      res
        .status(200)
        .send(user);
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
