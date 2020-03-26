const appLogger = require('pino')();
const botLogger = appLogger.child({ name: 'bot' });

module.exports = { appLogger, botLogger };
