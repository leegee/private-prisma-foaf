export type ILogger = {
  trace: Function,
  debug: Function,
  warn: Function,
  info: Function,
  error: Function
};

import { FastifyLoggerInstance } from 'fastify';
import { Console } from 'node:console';
import pino from 'pino';
// import PinoPretty from 'pino-pretty';

const config = {
  transport: undefined,
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : 'info',
};

const level = process.env.LOG_LEVEL || 'info';

let devConfig = {
  ...config,
  transport: {
    level,
    target: '../../test/lib/pino-log-message',
    options: {
      colorize: false,
      levelFirst: true,
      hidePretty: false,
      destination: 2,
      ignore: 'time,pid,hostname',
      hideObject: false,
      singleLine: false,
    }
  }
};

const myPino = pino({
  ...config,
  ...(process.env.NODE_ENV !== 'production' ? devConfig : [])
});

export const logger = myPino; // new Console(process.stdout, process.stderr);

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Init logging');
}

