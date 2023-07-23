const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

const JWT_SECRET = 'somethingverysecret';

module.exports = (req, res, next) => {
  // const { cookie } = req.headers;
  const token = req.cookies.jwt;
  console.log(req.cookies.jwt);
  // if (!cookie || !cookie.startsWith('jwt=')) {
  if (!token) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  // const token = cookie.replace('jwt=', '');
  // const token = cookie;
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
