import { supertest } from 'testlib/supertest';
import { server } from "../index";

describe('PUT /predicate', () => {
  describe('should put "Oswald assassinates JFK"', () => {
    it('Verb "assassinates" exists', async () => {

      await server.ready()

      const res = await supertest(server.server)
        .get('/verb?q=assassinates')
        .expect(200)
        .validateSchema()
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(res.body.verbs[0].name).toEqual('assassinates');
    });
  });
});

