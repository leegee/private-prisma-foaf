import { FastifyInstance } from 'fastify';
import { pactum } from 'testlib/pactum';

import { start as startServer } from 'src/server';
import PrismaTestEnvironment from 'testlib/prisma-test-env';

import Console from 'console';
console.log = Console.log;
console.info = Console.info;
console.debug = Console.debug;
console.warn = Console.warn;

PrismaTestEnvironment.init();

let server: FastifyInstance;

jest.setTimeout(1000 * 10);

beforeAll(async () => {
  // await pactum.mock.start(4000);
  server = await startServer();
  pactum.request.setBaseUrl(`http://localhost:${process.env.ERD_PORT || 3000}`);
});

afterAll(async () => {
  // await pactum.mock.stop();
  server.close();
});


describe('GET /entity?q=', () => {

  it('should should get JFK', async () => {
    await pactum.spec()
      .get('/entity')
      .withQueryParams({ q: 'jfk' })
      .expectStatus(200)
      .expectJsonLike({
        entities: [{
          knownas: 'jfk',
          approved: false,
          dob: null,
          dod: null,
          familyname: "kennedy",
          formalname: "jfk",
          givenname: "john",
          id: '#type:number',
          middlenames: "fitzgerald",
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
