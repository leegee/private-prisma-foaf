// Pino's primary usage writes ndjson to `stdout`:
//
//  export const logger = require('pino')();
//
// However, if "human readable" output is desired,
// `pino-pretty` can be provided as the destination
// stream:

import pino from 'pino';
// import pinoPretty from 'pino-pretty';


const pinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: false,
      level: process.env.LOG_LEVEL || 'trace',
    }
  },
});

const consoleLogger = console;
consoleLogger.debug = consoleLogger.info;

const usePino = true;

export const logger = usePino ? pinoLogger : consoleLogger;