import { start } from 'src/server';
import { logger } from 'src/service/logger';

// import PrismaTestEnvironment from "testlib/prisma-test-env";
// PrismaTestEnvironment.init();

start({ logger });
