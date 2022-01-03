import { Response } from 'supertest';
import PrismaTestEnvironment from 'testlib/prisma-test-env';
import { supertest, expectJsonLike } from 'testlib/supertest';

import { buildServer } from 'src/server';
import { prisma } from 'src/service/prisma-client';

PrismaTestEnvironment.setup();

const server = buildServer();

beforeAll(server.ready);

describe('PUT /predicate', () => {

  describe('should put "Oswald assassinates JFK"', () => {
    let assassinatesVerbId: number;

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
      await supertest(server.server)
        .get('/verb?q=assassinates')
        .expect(200)
        .then((res: Response) => {
          expectJsonLike(res.body, {
            verbs: [{
              name: 'assassinate',
            }]
          });

          assassinatesVerbId = res.body.verbs[0].id;
        });
    });

    describe('Sends predicate data', () => {
      jest.setTimeout(10000);

      it('Sends predicate data', async () => {
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

        const predicate = await prisma.predicate.findFirst({
          where: {
            verbId: assassinatesVerbId
          },
          select: {
            subjectId: true,
            verbId: true,
            objectId: true,
          }
        });

        expect(predicate).not.toBeNull();
      });

    });
  });
});

