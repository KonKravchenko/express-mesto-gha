const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { linkValid } = require('../utils/constants');
const {
  createCard, getCards, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(linkValid),
  }),
}), createCard);
router.get('/', getCards);
router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), deleteCard);
router.put('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), likeCard);
router.delete('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), dislikeCard);

module.exports = router;
