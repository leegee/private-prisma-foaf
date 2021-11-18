/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

import { prisma, setup, teardown } from 'testlib/fixtures';

beforeAll(async () => await setup());

afterAll(async () => await teardown());

describe('Initial scheme', () => {
  it('has people', async () => {
    const people = await prisma.person.findMany();
    expect(people).toHaveLength(3);
    expect(people[0].knownas).toBe("John F Kennedy");
    expect(people[1].knownas).toBe("Lee Harvey Oswald");
    expect(people[2].knownas).toBe("Arthur Young");

    people.forEach(async (person) => {
      const rv = await prisma.action.findMany({
        where: {
          subjectId: person.id
        },
        select: {
          start: true,
          end: true,
          Subject: true,
          Object: true,
          Verb: true,
        }
      });

      if (person.knownas.match(/Kennedy/)) {
        expect(rv).toHaveLength(0);
      } else {
        expect(rv).toHaveLength(1);
      }
    });
  });
});

