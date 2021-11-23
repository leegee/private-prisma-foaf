// Pino's primary usage writes ndjson to `stdout`:
//
//  export const logger = require('pino')();
//
// However, if "human readable" output is desired,
// `pino-pretty` can be provided as the destination
// stream:

import { Console } from 'console';
import util from 'util';

// import pino from 'pino';
// import pinoPretty from 'pino-pretty';


// logger = pino({
//   transport: {
//     target: 'pino-pretty',
//     options: {
//       colorize: false,
//       level: process.env.LOG_LEVEL || 'trace',
//     }
//   },
// });

export type ILogger = {
  trace: Function,
  debug: Function,
  warn: Function,
  info: Function,
  error: Function
};

const log = (...args: any[]) => {
  process.stdout.write(util.inspect(args, true, null, true) + "\n");
};

export const logger: ILogger = {
  trace: log,
  debug: log,
  warn: log,
  info: log,
  error: log
};

const noop = () => { };

export const nullLogger: ILogger = {
  trace: noop,
  debug: noop,
  warn: noop,
  info: noop,
  error: noop
};

