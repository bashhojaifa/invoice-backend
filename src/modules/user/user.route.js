const express = require('express');
const userController = require('./user.controller');
const validate = require('../../middleware/validate');
const {
  loginValidation,
  adminRegisterValidation,
  refreshTokensValidation,
} = require('./user.validate');
const auth = require('../../middleware/auth');
const { Roles } = require('../../constants/enums/roles');

const router = express.Router();

router.get('/', auth([Roles.ADMIN]), userController.getAllUsers);

router.post('/login', validate(loginValidation), userController.login);

router.post('/admin-register', validate(adminRegisterValidation), userController.register);

router.patch('/refresh-token', validate(refreshTokensValidation), userController.refreshTokens);

router.post('/logout', userController.logout);

module.exports = router;
