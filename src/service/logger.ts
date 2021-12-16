export type ILogger = {
  trace: Function,
  debug: Function,
  warn: Function,
  info: Function,
  error: Function
};

import pino from 'pino';

export const level = process.env.LOG_LEVEL || 'info';

const config = {
  transport: undefined,
  level
};


const devConfig = {
  transport: {
    level,
    target: '../../test/lib/pino-log-message',
    options: {
      destination: 1, // 2=stderr
      colorize: true,
      levelFirst: true,
      hidePretty: false,
      hideObject: false,
      singleLine: false,
      ignore: 'time,pid,hostname',
    }
  }
};

export const logger = pino(
  process.env.NODE_ENV === 'production' ? config : devConfig
);

/*
if (process.env.NODE_ENV === 'production'){
  logger.destination(
}
*/

logger.debug('Init logger');

