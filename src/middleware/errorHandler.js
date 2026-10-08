const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { ErrorCodes } = require('../errors/errorCodes');

function errorHandler(err, _req, res, _next) {
  const status = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
  const isServerError = status >= StatusCodes.INTERNAL_SERVER_ERROR;
  const code = err.code ?? (isServerError ? ErrorCodes.INTERNAL_ERROR : ErrorCodes.BAD_REQUEST);
  const message = isServerError ? getReasonPhrase(status) : err.message;
  res.status(status).json({ error: { code, message } });
}

module.exports = { errorHandler };