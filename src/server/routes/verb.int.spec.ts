import { pactum } from 'testlib/pactum';

const supertest = require('supertest')
import { server } from "../index";

describe('PUT /predicate', () => {
  describe('should put "Oswald assassinates JFK"', () => {
    it('Verb "assassinates" exists', async () => {

      await server.ready()

      const response = await supertest(server.server)
        .get('/verb')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');


      // await (expect(joi.validate(schema).error).to.be.null);

      expect(response.body).toEqual({
        verbs: [{
          name: 'assassinates',
          id: '#type:number',
        }]
      });

      // await pactum.spec()
      //   .get('/verb')
      //   .withQueryParams({ q: 'assassinates' })
      //   .expectStatus(200)
      //   .expectJsonLike({
      //     verbs: [{
      //       name: 'assassinates',
      //       id: '#type:number',
      //     }]
      //   });

    });
  });
});

