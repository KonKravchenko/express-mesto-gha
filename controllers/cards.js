// const mongoose = require('mongoose');
const Card = require('../models/card');

const ERROR_BAD_REQUEST = 400;
const ERROR_NOT_FOUND = 404;
const ERROR_INTERNAL_SERVER = 500;

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user.id;

  Card.create({ name, link, owner })
    .then((card) => {
      res
        .status(201)
        .send({ data: card });
    })
    .catch(next);
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((card) => {
      res.send({ data: card });
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const cardId = req.params.id;
  const userId = req.user.id;
  Card.findById(cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => {
      if (card.owner.toString() === userId) {
        Card.findByIdAndRemove(cardId)
          .then((data) => {
            res
              .status(200)
              .send({ data, message: 'Карточка удалена' });
          })
          // .catch(() => {
          //   res
          //     .status(ERROR_INTERNAL_SERVER)
          //     .send({ message: 'Ошибка сервера' });
          // });
          .catch(next);
      } else {
        res
          .status(403)
          .send({ message: 'У вас нет прав на удаление данной карточки' });
      }
    })
    // .catch((err) => {
    //   if (err.message === 'NotValidId') {
    //     res
    //       .status(ERROR_NOT_FOUND)
    //       .send({ message: 'Карточка не найдена' });
    //   } else if (err.name === 'CastError') {
    //     res
    //       .status(ERROR_BAD_REQUEST)
    //       .send({ message: 'Переданы некорректные данные' });
    //   } else {
    //     res
    //       .status(ERROR_INTERNAL_SERVER)
    //       .send({ message: 'Ошибка сервера' });
    //   }
    // });
    .catch(next);
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user.id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Карточка не найдена' });
      } else if (err.name === 'CastError') {
        // console.log(err.name)
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
      } else {
        // console.log(err)
        res
          .status(ERROR_INTERNAL_SERVER)
          .send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user.id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        res
          .status(ERROR_NOT_FOUND)
          .send({ message: 'Карточка не найдена' });
      } else if (err.name === 'CastError') {
        // console.log(err.name)
        res
          .status(ERROR_BAD_REQUEST)
          .send({ message: 'Переданы некорректные данные' });
      } else {
        // console.log(err)
        res
          .status(ERROR_INTERNAL_SERVER)
          .send({ message: 'Ошибка сервера' });
      }
    });
};
