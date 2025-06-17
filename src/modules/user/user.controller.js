const httpStatus = require('../../constants/httpStatus');
const catchAsync = require('../../utils/catchAsync');
const userService = require('./user.service');
const { Roles } = require('../../constants/enums/roles');
const { generateUniqueCode } = require('../../utils/randomCode');

/**
 * @desc Register a new admin user
 * @route POST /api/users/register
 */
const register = catchAsync(async (req, res) => {
  const user = await userService.register({
    ...req.body,
    account_number: generateUniqueCode(5),
    role: Roles.ADMIN,
  });

  res.status(httpStatus.CREATED).json({
    data: user,
    message: 'User registered successfully',
  });
});

/**
 * @desc Get all users
 * @route GET /api/users
 */
const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();

  res.status(httpStatus.OK).json({
    data: users,
    message: 'Users retrieved successfully',
  });
});

/**
 * @desc Login user and generate tokens
 * @route POST /api/users/login
 */
const login = catchAsync(async (req, res) => {
  const data = await userService.login(req.body);

  res.status(httpStatus.OK).json({
    data,
    message: 'Login successful',
  });
});

/**
 * @desc Refresh user tokens
 * @route POST /api/users/refresh-tokens
 */
const refreshTokens = catchAsync(async (req, res) => {
  const data = await userService.refreshTokens(req.body.refreshToken);

  res.status(httpStatus.OK).json({
    data,
    message: 'Tokens refreshed successfully',
  });
});

/**
 * Logout user
 * @route POST /api/users/logout
 * @returns {Object} 200 - Success message
 */
const logout = catchAsync(async (req, res) => {
  await userService.logout(req.body.accessToken);

  res.status(httpStatus.OK).json({
    message: 'Logout successful',
  });
});

module.exports = { register, getAllUsers, login, refreshTokens, logout };
