const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, getUser, changeProfileNameAbout, changeProfileAvatar, getAuthUser,
} = require('../controllers/users');

// const auth = require('../middlewares/auth');

// router.post('/', createUser);
router.get('/', getUsers);
router.get('/me', getAuthUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), changeProfileNameAbout);
router.get('/:id', getUser);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string(),
  }),
}), changeProfileAvatar);

module.exports = router;
