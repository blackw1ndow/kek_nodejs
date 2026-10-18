const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');

/**
 * Middleware factory to enforce RBAC permissions.
 *
 * @param {...string} allowedRoles Allowed user roles (e.g., 'ADMIN', 'MANAGER')
 * @returns {import('express').RequestHandler}
 */
function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Access forbidden: insufficient rights'));
    }

    return next();
  };
}

module.exports = { authorize };
