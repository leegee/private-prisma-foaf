const pactum = require('pactum');

// import PrismaTestEnvironment from "testlib/prisma-test-env";
// PrismaTestEnvironment.setupOnce();

const { buildServer } = require('../dist/src/server');

// require('pactum-supertest')(buildServer());
require('./lib/pactum-supertest-2')(buildServer());

pactum.handler.addAssertHandler('type', (ctx) => {
  return typeof ctx.data === ctx.args[0];
});

beforeAll(async () => {
  // await pactum.mock.start(4000);
  pactum.request.setBaseUrl(`http://localhost:${process.env.ERD_API_PORT || 3000}`);
});

describe('pactum fastify test', () => {
  it('some test', async () => {
    pactum.spec()
      .get('/')
      .expectStatus(200);
  });


});

/*
const app = require('./path/to/server');
require('pactum-supertest')(app);

it('some test', () => {
  return pactum.spec()
    .get('<url>')
    .expectStatus(200);
});
*/