const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MYSQL_HOST: Joi.string().required().description('MySQL host'),
    MYSQL_PORT: Joi.number().default(3306),
    MYSQL_USERNAME: Joi.string().required().description('MySQL username'),
    MYSQL_PASSWORD: Joi.string().required().description('MySQL password'),
    MYSQL_DATABASE: Joi.string().required().description('MySQL database name'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION: Joi.string()
      .default('30d')
      .description('days after which access tokens expire'),
    JWT_REFRESH_EXPIRATION: Joi.string()
      .default('15m')
      .description('minutes after which refresh tokens expire'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  mysql: {
    host: envVars.MYSQL_HOST,
    port: envVars.MYSQL_PORT,
    username: envVars.MYSQL_USERNAME,
    password: envVars.MYSQL_PASSWORD,
    database: envVars.MYSQL_DATABASE,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpiration: envVars.JWT_ACCESS_EXPIRATION,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRATION,
  },
};
