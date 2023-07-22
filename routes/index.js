const router = require('express').Router();
// const { celebrate, Joi, Segments } = require('celebrate');
const userRoutes = require('./users');
const cardRoutes = require('./cards');

const ERROR_NOT_FOUND = 404;

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use('*', (req, res) => {
  res
    .status(ERROR_NOT_FOUND)
    .send({ message: 'Неверный путь' });
});

module.exports = router;
