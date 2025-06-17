const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate access token (short lifespan)
exports.generateAccessToken = user => {
  return jwt.sign({ sub: { id: user.id, role: user.role } }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration,
  });
};

// Generate refresh token (longer lifespan)
exports.generateRefreshToken = user => {
  return jwt.sign({ sub: { id: user.id, role: user.role } }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiration,
  });
};

// Verify any token
exports.verifyToken = token => {
  return jwt.verify(token, config.jwt.secret);
};
