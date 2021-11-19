/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

import { prisma, setup, teardown } from 'testlib/fixtures';

beforeAll(async () => await setup());

afterAll(async () => await teardown());

describe('Initial scheme', () => {
  it('has people', async () => {
    const people = await prisma.entity.findMany();
    expect(people).toHaveLength(3);
    expect(people[0].formalname).toBe("John F Kennedy");
    expect(people[1].formalname).toBe("Lee Harvey Oswald");
    expect(people[2].formalname).toBe("Arthur M Young");

    people.forEach(async (entity) => {
      const rv = await prisma.action.findMany({
        where: {
          subjectId: entity.id
        },
        select: {
          start: true,
          end: true,
          Subject: true,
          Object: true,
          Verb: true,
        }
      });

      if (entity.knownas.match(/JFK/)) {
        expect(rv).toHaveLength(0);
      } else {
        expect(rv).toHaveLength(1);
      }
    });
  });
});

