import PrismaTestEnvironment from "testlib/prisma-test-env";

import { supertest } from 'testlib/supertest';
import { buildServer } from "../index";

PrismaTestEnvironment.setup();

const server = buildServer();
beforeAll(server.ready);

describe('GET /entity?q=', () => {

  it('should should get JFK', async () => {

    const res = await supertest(server.server)
      .get('/entity?q=jfk')
      .expect(200)
      .validateSchema()
      .expect('Content-Type', 'application/json; charset=utf-8');

    expect(res.body.entities[0]).toEqual(
      expect.objectContaining(
        { "approved": false, "dob": null, "dod": "1963-11-22T00:00:00.000Z", "familyname": "kennedy", "formalname": "john f kennedy", "givenname": "john", "id": 16, "knownas": "jfk", "middlenames": "fitzgerald" }
      )
    );

  });
});
