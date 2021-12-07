import pactum from 'pactum';
import { FastifyInstance } from 'fastify';

import PrismaTestEnvironment from "testlib/prisma-test-env";
import { start as startServer } from 'src/server';

type assertionHandlerCtx = {
  [key: string]: any;
};

PrismaTestEnvironment.init();
jest.setTimeout(1000 * 30);

pactum.handler.addAssertHandler('type', (ctx: assertionHandlerCtx) => {
  return typeof ctx.data === ctx.args[0];
});

export { pactum };

import Console from 'console';
console.log = Console.log;
console.info = Console.info;
console.debug = Console.debug;
console.warn = Console.warn;


let server: FastifyInstance;

beforeAll(async () => {
  // await pactum.mock.start(4000);
  server = await startServer();
  pactum.request.setBaseUrl(`http://localhost:${process.env.ERD_PORT || 3000}`);
});

afterAll(async () => {
  // await pactum.mock.stop();
  server.close();
});
