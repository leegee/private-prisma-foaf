import { Response } from 'supertest';
import PrismaTestEnvironment from 'testlib/prisma-test-env';
import { supertest, expectJsonLike } from 'testlib/supertest';

import { buildServer } from 'src/server';
import { logger } from 'src/service/logger';

PrismaTestEnvironment.setup();

const server = buildServer({ logger: true });

beforeAll(server.ready);

describe('PUT /predicate', () => {

  describe('should put "Oswald assassinates JFK"', () => {
    it('JFK exists', async () => {
      await supertest(server.server)
        .get('/entity?q=jfk')
        .expect(200)
        .then((res: Response) => expectJsonLike(res.body, {
          entities: [{
            knownas: 'jfk',
            formalname: 'john f kennedy',
            'approved': false,
            'dob': null,
            "dod": "1963-11-22T00:00:00.000Z",
            'familyname': 'kennedy',
            'givenname': 'john',
            'middlenames': 'fitzgerald',
          }]
        }));
    });

    it('Oswald exists', async () => {
      await supertest(server.server)
        .get('/entity?q=oswald')
        .expect(200)
        .then((res: Response) => expectJsonLike(res.body, {
          entities: [{
            knownas: 'oswald',
            formalname: 'lee harvey oswald',
            'approved': false,
            'dob': null,
            'dod': null,
            'familyname': null,
            'givenname': null,
            'middlenames': null,
          }]
        }));
    });

    it('Verb "assassinates" exists', async () => {
      const res = await supertest(server.server)
        .get('/verb?q=assassinates')
        .expect(200)
        .then((res: Response) => expectJsonLike(res.body, {
          verbs: [{
            name: 'assassinates',
          }]
        }));
    });

    it('Sends predicate data', async () => {
      jest.setTimeout(10000);
      await supertest(server.server)
        .post('/predicate')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
          Subject: 'oswald',
          Verb: 'assassinates',
          Object: 'jfk',
        })
        .expect(201);
    });

  });

});
