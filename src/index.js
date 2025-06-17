const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');
const sequelize = require('./config/database');
const setupAssociations = require('./modules/association');

setupAssociations();

let server;
// Sync database and start the server
sequelize
  .sync({ force: false }) // Change to true to re-create tables
  .then(() => {
    logger.info('Database connected successfully.');

    // Start the server
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch(err => {
    logger.error('Error during database initialization:', err);
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = error => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
