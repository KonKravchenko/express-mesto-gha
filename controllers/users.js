/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const User = require('../models/user');

const ERROR_BAD_REQUEST = 400;
const ERROR_NOT_FOUND = 404;
const ERROR_INTERNAL_SERVER = 500;

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  if (!name || !about || !avatar) {
    res
      .status(ERROR_BAD_REQUEST)
      .send({ message: 'Переданы некорректные данные' });
    return;
  }

  User.create({ name, about, avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      // тут проверяем не является ли ошибка
      // ошибкой валидации
      if (error instanceof mongoose.Error.ValidationError) {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
        return;
      }
      // в остальных случаях выкидываем 500 ошибку
      res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'Ошибка сервера' });
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res
        .status(200)
        .send(users);
    })
    .catch((error) => {
      if (error === ERROR_BAD_REQUEST) {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
        return;
      }
      // в остальных случаях выкидываем 500 ошибку
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
      } else {
        res
          .status(ERROR_INTERNAL_SERVER)
          .send({ message: 'Ошибка сервера' });
      }
    });
};

const changeProfileData = (req, res) => {
  const { name, about } = req.body;

  if (!name || !about) {
    res
      .status(ERROR_BAD_REQUEST)
      .send({ message: 'Переданы некорректные данные' });
    return;
  }

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true },
  )
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
        return;
      }

      res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'Ошибка сервера' });
    });
};

const changeAvatar = (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    res
      .status(ERROR_BAD_REQUEST)
      .send({ message: 'Переданы некорректные данные' });
    return;
  }
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true },
  )
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
        return;
      }
      res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'Ошибка сервера' });
    });
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  changeProfileData,
  changeAvatar,
};
