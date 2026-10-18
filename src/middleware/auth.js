const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { UnauthorizedError } = require('../errors/AppError');

/**
 * Middleware to authenticate requests via JWT Bearer token.
 * Populates req.user with decoded payload upon success.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
function auth(req, _res, next) {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token not provided');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new UnauthorizedError('Token not provided');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

module.exports = { auth };
