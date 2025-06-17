const Joi = require('joi');

const createInvoicesValidation = {
  body: Joi.object().keys({
    first_name: Joi.string().required().label('First name'),
    last_name: Joi.string().required().label('Last name'),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .label('Email'),
    amount: Joi.number().positive().required().label('Amount'),
    currency: Joi.string().required().label('Currency'),
    due_on: Joi.date().required().label('Due date'),
    account_number: Joi.string().required().label('Account number'),
    password: Joi.string().min(6).required().label('Password'),
    role: Joi.string().valid('ADMIN', 'CUSTOMER').required().label('Role'),
  }),
};

module.exports = {
  createInvoicesValidation,
};
