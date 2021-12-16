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


let devConfig = {
  transport: {
    level,
    target: '../../test/lib/pino-log-message',
    options: {
      colorize: true,
      levelFirst: true,
      hidePretty: false,
      destination: 2,
      ignore: 'time,pid,hostname',
      hideObject: false,
      singleLine: false,
    }
  }
};

const myPino = pino(
  (process.env.NODE_ENV === 'production' ? config : devConfig)
);

export const logger = myPino; // new Console(process.stdout, process.stderr);

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Init logging');
}

