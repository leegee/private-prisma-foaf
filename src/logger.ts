export type ILogger = {
  trace: Function,
  debug: Function,
  warn: Function,
  info: Function,
  error: Function
};

import pino from 'pino';
import PinoPretty from 'pino-pretty';

const config = {
  transport: undefined,
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : 'info',
};

let devConfig = {
  ...config,
  transport: {
    target: '../test/lib/pino-log-message',
    options: {
      levelFirst: true,
      hidePretty: false,
      destination: 2,
    }
  }
};


export const logger = pino({
  ...config,
  ...(process.env.NODE_ENV !== 'production' ? devConfig : [])
});

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Init logging');
}

