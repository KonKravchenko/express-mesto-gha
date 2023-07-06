const router = require('express').Router();

const {
  createUser, getUsers, getUser, changeProfileNameAbout, changeProfileAvatar,
} = require('../controllers/users');

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/me', changeProfileNameAbout);
router.patch('/me/avatar', changeProfileAvatar);

module.exports = router;
