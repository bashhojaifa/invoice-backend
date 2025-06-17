const { Sequelize } = require('sequelize');
const config = require('./config');
// require('../modules/association');

// Sequelize instance for MySQL connection
const sequelize = new Sequelize(
  config.mysql.database,
  config.mysql.username,
  config.mysql.password,
  {
    host: config.mysql.host,
    dialect: 'mysql',
    logging: false,
  },
);

module.exports = sequelize;
