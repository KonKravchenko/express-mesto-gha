/* eslint-disable */
class ErrorAPI extends Error {
  constructor(message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorAPI;
