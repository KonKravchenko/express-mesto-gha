const mongoose = require('mongoose');
const Card = require('../models/card');

const ERROR_BAD_REQUEST = 400;
const ERROR_NOT_FOUND = 404;
const ERROR_INTERNAL_SERVER = 500;

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  if (!name || !link) {
    res
      .status(ERROR_BAD_REQUEST)
      .send({ message: 'Переданы некорректные данные' });
    return;
  }

  Card.create({ name, link, owner })
    .then((card) => {
      res.send({ data: card });
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

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      res.status(400).send(error);
    });
};

module.exports.deleteCard = (req, res) => {
  const { id } = req.params;
  Card.findByIdAndRemove(id)
    .orFail(new Error('NotValidId'))
    .then((card) => {
      res
        .status(200)
        .send({ data: card, message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Карточка не найдена' });
      } else {
        res
          .status(ERROR_INTERNAL_SERVER)
          .send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.status(200).send({ data: card }))
    .catch(() => {
      res
        .status(ERROR_BAD_REQUEST)
        .send({ message: 'Переданы некорректные данные' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.status(200).send({ data: card }))
    .catch(() => {
      res
        .status(ERROR_INTERNAL_SERVER)
        .send({ message: 'Ошибка сервера' });
    });
};
