import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';

const testId = "init";

beforeAll(async () => {
  await setup(testId)
});

afterAll(async () => await teardown(testId));

describe('Initial scheme', () => {
  it('has people', async () => {
    const people = await prisma.person.findMany({
      where: {
        knownas: {
          endsWith: testId
        }
      }
    });
    expect(people).toHaveLength(3);
    expect(people[0].knownas).toBe("John F Kennedy" + testId);
    expect(people[1].knownas).toBe("Lee Harvey Oswald" + testId);
    expect(people[2].knownas).toBe("Arthur Young" + testId);

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

