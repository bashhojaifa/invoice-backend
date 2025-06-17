const jwt = require('jsonwebtoken');
const httpStatus = require('../constants/httpStatus');

// Internal imports
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { Roles } = require('../constants/enums/roles');
const userService = require('../modules/user/user.service');
const tokenHelper = require('../utils/tokenHelper');

const auth = roles => async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    const token = authorization.split(' ')[1];

    if (!token) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please login to access this resource'));
    }

    const decoded = tokenHelper.verifyToken(token, config.jwt.secret);

    if (!decoded) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token.'));
    }

    const user = await userService.findById(decoded.sub.id);

    if (roles.indexOf(user.role) === -1) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Not authorized.'));
    }

    if (user.role === Roles.ADMIN) {
      if (decoded.iat < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime() / 1000) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token.'));
      }
    }

    if (decoded.iat < new Date(user.updatedAt).getTime() / 1000) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token.'));
    }

    req.user = user;
    req.user.password = undefined;
    next();
  } catch (err) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token.'));
  }
};

module.exports = auth;
