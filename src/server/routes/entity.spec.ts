import { FastifyInstance } from 'fastify';
import { pactum } from 'testlib/pactum';


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
