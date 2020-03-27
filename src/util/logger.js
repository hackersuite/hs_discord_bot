const appLogger = require('pino')();
const botLogger = appLogger.child({ name: 'bot' });
const dbLogger = appLogger.child({ name: 'db' });

module.exports = { appLogger, botLogger, dbLogger };
