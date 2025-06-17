const {
  ValidationError,
  UniqueConstraintError,
  DatabaseError,
} = require("sequelize");
const httpStatus = require("../constants/httpStatus");
const config = require("../config/config");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

// Error converter middleware
const errorConverter = (err, req, res, next) => {
  let error = err;

  // Check if the error is not an instance of ApiError
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = error.message || httpStatus[statusCode];

    // Check for Sequelize-specific errors
    if (error instanceof ValidationError) {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Validation Error";
    } else if (error instanceof UniqueConstraintError) {
      statusCode = httpStatus.CONFLICT;
      message = "Unique Constraint Violation";
    } else if (error instanceof DatabaseError) {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Database Query Failed";
    }

    // Default error handler
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // In production, hide sensitive error details if the error is not operational
  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === "development" && { stack: err.stack }), // Show stack trace in development
  };

  // Log the error in development mode
  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
