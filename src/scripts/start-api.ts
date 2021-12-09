import { start } from 'src/server';

// import PrismaTestEnvironment from "testlib/prisma-test-env";
// PrismaTestEnvironment.init();

start({
  logger: {
    prettyPrint:
      process.env.NODE_END !== 'production'
        ? {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          level: 'debug'
        }
        : false
  }
});
