const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { linkValid } = require('../utils/constants');

const {
  getUsers, getUser, changeProfileNameAbout, changeProfileAvatar, getAuthUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getAuthUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), changeProfileNameAbout);
router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), getUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(linkValid),
  }),
}), changeProfileAvatar);

module.exports = router;
