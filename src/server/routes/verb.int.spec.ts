import { supertest } from 'testlib/supertest';
import { buildServer } from "../index";

const server = buildServer();

beforeAll(server.ready);

describe('PUT /predicate', () => {
  describe('should put "Oswald assassinates JFK"', () => {
    it('Verb "assassinates" exists', async () => {

      const res = await supertest(server.server)
        .get('/verb?q=assassinates')
        .expect(200)
        .validateSchema()
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(res.body.verbs[0]).toEqual(
        expect.objectContaining({ name: 'assassinates' })
      );
    });
  });
});

