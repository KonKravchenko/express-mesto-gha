/* eslint-disable */
class ErrorAPI extends Error {
  constructor( message, statusCode) {

    super(message);
    this.statusCode = statusCode;
    console.log('ErrorAPI', statusCode)
  }
}

module.exports = ErrorAPI;
