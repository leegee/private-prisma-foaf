// Pino's primary usage writes ndjson to `stdout`:
//
//  export const logger = require('pino')();
//
// However, if "human readable" output is desired,
// `pino-pretty` can be provided as the destination
// stream:

import util from 'util';

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

const log = (...args: any[]) => {
  // process.stderr.write()
  util.inspect(args, true, null, true);
};

const consoleLogger = {
  trace: log,
  debug: log,
  warn: log,
  info: log,
  error: log
};

const usePino = true;

export const logger = usePino ? pinoLogger : consoleLogger;
