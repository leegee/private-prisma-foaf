import { FastifyInstance } from 'fastify';
import pactum from 'pactum';
import { start as startServer } from '../server';

function handlers() {
  pactum.handler.addInteractionHandler('GET entity.knoanas', (ctx) => {
    return {
      request: {
        method: 'GET',
        path: '/entity?x=ffffffffffffffffffffffffffffffffffffffffff',
        queryParams: { q: ctx.data.q }
      },
      response: {
        status: 200,
        body: [ctx.data.expectResBody]
      }
    };
  });
}

let server: FastifyInstance;

beforeAll(async () => {
  await pactum.mock.start(4000);
  handlers();
  server = await startServer();
  pactum.request.setBaseUrl(`http://localhost:${process.env.ERD_PORT || 3000}`);
});

afterAll(async () => {
  await pactum.mock.stop();
  server.close();
});

const expectJfk = {
  knownas: 'jfk',
  formalname: 'John Fitzgerald Kennedy',
};

describe('GET /entity?q=', () => {

  it('should should get JFK', async () => {
    pactum.spec()
      .useInteraction('GET entity.knoanas', { q: 'jfk', expectResBody: expectJfk })
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
