import pino = require('pino');

const logger: any = pino({
  name: 'OAI-PMH harvester',
  level: process.env.LOG_LEVEL,
});

export default logger;
