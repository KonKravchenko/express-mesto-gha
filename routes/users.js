const router = require('express').Router();

const {
  createUser, getUsers, getUser, changeProfileData, changeAvatar,
} = require('../controllers/users');

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/me', changeProfileData);
router.patch('/me/avatar', changeAvatar);

module.exports = router;
