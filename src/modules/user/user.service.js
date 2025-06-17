const httpStatus = require('../../constants/httpStatus');
const ApiError = require('../../utils/ApiError');
const User = require('./user.entity');
const tokenHelper = require('../../utils/tokenHelper');

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<User>} - User object
 */
const findById = async id => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password', 'accessToken', 'refreshToken'] }, // Exclude sensitive fields
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

/**
 * Register a user
 * @param {Object} userData - The user data to register
 * @returns {Promise<User>} The created user object
 */
const register = async userData => {
  const existing = await User.findOne({ where: { email: userData.email } });

  if (existing) throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');

  return User.create(userData);
};

/**
 * Get all users
 * @returns {Promise<Array<User>>} - List of all users
 */
const getAllUsers = () => {
  const users = User.findAll({
    attributes: { exclude: ['password', 'accessToken', 'refreshToken'] }, // Exclude sensitive fields
  });
  return users;
};

/**
 * Login a user and generate tokens
 * @param {Object} param0 - Login credentials
 * @param {string} param0.email - User email
 * @param {string} param0.password - User password
 * @returns {Promise<User>} - User object with tokens
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const accessToken = tokenHelper.generateAccessToken(user);
  const refreshToken = tokenHelper.generateRefreshToken(user);

  await user.update({ accessToken, refreshToken });

  return user;
};

/**
 * Refresh user tokens
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<Object>} - New access and refresh tokens
 */
const refreshTokens = async refreshToken => {
  try {
    const decoded = tokenHelper.verifyToken(refreshToken);

    const user = await User.findByPk(decoded.sub.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }

    const newAccessToken = tokenHelper.generateAccessToken(user);
    const newRefreshToken = tokenHelper.generateRefreshToken(user);

    await user.update({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token expired or invalid');
  }
};

/**
 * Logout user
 * Invalidates the access and refresh tokens
 * @param {number} userId - ID of the user to logout
 * @returns {Promise<void>}
 */
const logout = async token => {
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'No token provided');
  }

  const decoded = tokenHelper.verifyToken(token);

  const user = await User.findByPk(decoded.sub.id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await user.update({ accessToken: null, refreshToken: null });
};

module.exports = { findById, register, getAllUsers, login, refreshTokens, logout };
