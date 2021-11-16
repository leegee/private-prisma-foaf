import { prisma, setup, teardown } from 'testlib/fixtures';

const testId = "init";

const fixtures = beforeAll(async () => {
  return await setup(testId)
});

afterAll(async () => await teardown(fixtures));

describe('Initial scheme', () => {
  it('has people', async () => {
    const people = await prisma.person.findMany();
    expect(people).toHaveLength(3);
    expect(people[0].knownas).toBe("John F Kennedy" + testId);
    expect(people[1].knownas).toBe("Lee Harvey Oswald" + testId);
    expect(people[2].knownas).toBe("Arthur Young" + testId);
  });

  it('has people with action', async () => {
    const rv = await prisma.action.findMany({
      select: {
        start: true,
        end: true,
        Subject: true,
        Object: true,
        Verb: true,
      }
    });

    expect(rv).toHaveLength(2);

    expect(rv[0].Subject.knownas).toBe('John F Kennedy' + testId);
    expect(rv[0].Object.knownas).toBe('Lee Harvey Oswald' + testId);
    expect(rv[0].Verb.name).toBe('assassinates' + testId);
    expect(rv[0].start).toBeDate('1963-11-22');
    expect(rv[0].end).toBeDate('1963-11-22');

    expect(rv[1].Subject.knownas).toBe('Arthur Young' + testId);
    expect(rv[1].Object.knownas).toBe('Lee Harvey Oswald' + testId);
    expect(rv[1].Verb.name).toBe('hosts' + testId);
    expect(rv[1].start).toBeDate('1963-11-21');
    expect(rv[1].end).toBeDate('1963-11-22');
  });
});


