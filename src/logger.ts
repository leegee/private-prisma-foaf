// Pino's primary usage writes ndjson to `stdout`:
//
//  export const logger = require('pino')();
//
// However, if "human readable" output is desired,
// `pino-pretty` can be provided as the destination
// stream:

import pino from 'pino';
// import pinoPretty from 'pino-pretty';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    // https://github.com/pinojs/pino-pretty#options
    options: {
      colorize: false
    }
  },
});
