export type ILogger = {
  trace: Function,
  debug: Function,
  warn: Function,
  info: Function,
  error: Function
};

import pino from 'pino';

const config = {
  transport: undefined,
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : 'trace',
};

let devConfig = {
  transport: {
    target: 'pino-pretty',
    options: { levelFirst: true, },
  }
};


export const logger = pino({
  ...config,
  ...(process.env.NODE_ENV !== 'production' ? devConfig : [])
});

logger.info('Init logging');
