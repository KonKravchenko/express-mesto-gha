const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const JWT_SECRET = 'somethingverysecret';

module.exports = (req, res, next) => {
  const { cookie } = req.headers;

  if (!cookie || !cookie.startsWith('jwt=')) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  const token = cookie.replace('jwt=', '');
  let payload;

  try {
    // верифицируем токен
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация');
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
