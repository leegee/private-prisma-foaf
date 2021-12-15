import PrismaTestEnvironment from "testlib/prisma-test-env";

import { supertest } from 'testlib/supertest';
import { buildServer } from "../index";

PrismaTestEnvironment.init();

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
      expect.objectContaining({
        "approved": false,
        "dob": null,
        "dod": null,
        "familyname": null,
        "formalname": "jfk",
        "givenname": null,
        "id": 19,
        "knownas": "jfk",
        "middlenames": null
      })
    );

  });

});
