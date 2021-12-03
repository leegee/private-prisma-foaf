import PrismaTestEnvironment from "testlib/prisma-test-env";

import { FastifyInstance } from 'fastify';
import pactum from 'pactum';
import { start as startServer } from '../server';

PrismaTestEnvironment.init();
jest.setTimeout(1000 * 30);

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


describe('PUT /predicate', () => {

  describe('should put "Oswald assassinated JFK"', () => {
    it('JFK exists', async () => {
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
    });

    it('Oswald exists', async () => {
      await pactum.spec()
        .get('/entity')
        .withQueryParams({ q: 'oswald' })
        .expectStatus(200)
        .expectJson({
          entities: [{
            knownas: 'oswald',
            formalname: 'Lee Harvey Oswald',
          }]
        })
    });

    it('Verb "assinates" exists', async () => {
      await pactum.spec()
        .get('/verb')
        .withQueryParams({ q: 'assinates' })
        .expectStatus(200)
        .expectJson({
          verbs: [{
            name: 'assinates',
          }]
        })
    });

    it('Sends preicate', async () => {
      await pactum.spec()
        .put('/predicate')
        .withJson({
          Subject: { knownas: 'oswald' },
          Verb: { name: 'assinates' },
          Object: { knownas: 'jfk' },
        })
        .expectStatus(201);
    });

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
