const router = require('express').Router();

const {
  getUsers, getUser, changeProfileNameAbout, changeProfileAvatar, getAuthUser,
} = require('../controllers/users');

// const auth = require('../middlewares/auth');

// router.post('/', createUser);
router.get('/', getUsers);
router.get('/me', getAuthUser);
router.get('/:id', getUser);
router.patch('/me', changeProfileNameAbout);
router.patch('/me/avatar', changeProfileAvatar);

module.exports = router;
