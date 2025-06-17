const Joi = require('joi');

const loginValidation = {
  body: Joi.object().keys({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Invalid email address',
      }),
    password: Joi.string().min(6).required(),
  }),
};

const adminRegisterValidation = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
  }),
};

const refreshTokensValidation = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = { loginValidation, adminRegisterValidation, refreshTokensValidation };
