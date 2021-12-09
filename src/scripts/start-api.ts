import { start } from 'src/server';

// import PrismaTestEnvironment from "testlib/prisma-test-env";
// PrismaTestEnvironment.init();

start({
  logger: {
    level: 'trace',
    prettyPrint: {
      ignore: 'pid,hostname,reqId,id',
    }
  }
});
