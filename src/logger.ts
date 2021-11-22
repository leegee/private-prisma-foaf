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
    // https://github.com/pinojs/pino-pretty#options
    options: {
      colorize: false
    }
  },
});

const consoleLogger = console;
consoleLogger.debug = consoleLogger.info;

const usePino = false;

export const logger = usePino ? pinoLogger : consoleLogger;
