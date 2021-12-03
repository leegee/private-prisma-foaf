import { FastifyInstance } from 'fastify';
import pactum from 'pactum';

import { start as startServer } from 'src/server';
import PrismaTestEnvironment from 'testlib/prisma-test-env';

PrismaTestEnvironment.init();

let server: FastifyInstance;

beforeAll(async () => {
  await pactum.mock.start(4000);
  server = await startServer();
  pactum.request.setBaseUrl(`http://localhost:${process.env.ERD_PORT || 3000}`);
});

afterAll(async () => {
  await pactum.mock.stop();
  server.close();
});


describe('GET /entity?q=', () => {

  it('should should get JFK', async () => {
    await pactum.spec()
      .get('/entity')
      .withQueryParams({ q: 'jfk' })
      .expectStatus(200)
      .expectJson({
        entities: [{
          knownas: 'jfk',
          formalname: 'John Fitzgerald Kennedy',
        }]
      })
    // .post('/entity/jfk')
    // .withJson({
    //   formalname: "John Test Kennedy"
    // })
    // .expectStatus(200)
    // .useInteraction({
    //   request: {
    //     method: 'GET',
    //     path: '/entity',
    //     queryParams: { q: 'jfk' }
    //   },
    //   response: {
    //     status: 200,
    //     body: [{
    //       knownas: 'jfk',
    //       formalname: "John Test Kennedy",
    //     }]
    //   }
    // });
  });

});
