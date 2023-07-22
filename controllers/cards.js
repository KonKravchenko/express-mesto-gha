const Card = require('../models/card');
// const UnauthorizedError = require('../errors/unauthorized-err');
const ForbidenError = require('../errors/forbiden-err');
const NotFoundError = require('../errors/not-found-err');
// const ConflictingRequestError = require('../errors/conflicting-request-err');

// const ERROR_NOT_FOUND = 404;

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
          .catch(next);
      }
      // else {
      // res
      //   .status(403)
      //   .send({ message: 'У вас нет прав на удаление данной карточки' });
      throw new ForbidenError('У вас нет прав на удаление данной карточки');
      // }
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        // res
        //   .status(ERROR_NOT_FOUND)
        //   .send({ message: 'Карточка не найдена' });
        throw new NotFoundError('Карточка не найдена');
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user.id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        // res
        //   .status(ERROR_NOT_FOUND)
        //   .send({ message: 'Карточка не найдена' });
        throw new NotFoundError('Карточка не найдена');
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user.id } },
    { new: true },
  )
    .orFail(new Error('NotValidId'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        // res
        //   .status(ERROR_NOT_FOUND)
        //   .send({ message: 'Карточка не найдена' });
        throw new NotFoundError('Карточка не найдена');
      }
    })
    .catch(next);
};
