import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  const assassinates = await prisma.verb.create({
    data: { name: 'assassinates' }
  });

  const hosts = await prisma.verb.create({
    data: { name: 'hosts' }
  });

  const jfk = await prisma.person.create({
    data: { knownas: 'John F Kennedy', },
  });

  const oswald = await prisma.person.create({
    data: { knownas: 'Lee Harvey Oswald', },
  });

  const arthur = await prisma.person.create({
    data: { knownas: 'Arthur Young', },
  });

  await prisma.action.create({
    data: {
      verbId: assassinates.id,
      subjectId: jfk.id,
      objectId: oswald.id,
      start: new Date('1963-11-22'),
      end: new Date('1963-11-22'),
    },
  });

  // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-a-new-profile-record-then-connect-it-to-an-existing-user-record-or-create-a-new-user
  await prisma.action.create({
    data: {
      verbId: hosts.id,
      subjectId: arthur.id,
      objectId: oswald.id,
      start: new Date('1963-11-21'),
      end: new Date('1963-11-22'),
    },
  });

});

afterAll(async () => {
  await prisma.action.deleteMany();
  await prisma.verb.deleteMany();
  await prisma.person.deleteMany();
  await prisma.$disconnect();
});


describe('Initial scheme', () => {
  it('has people', async () => {
    const people = await prisma.person.findMany();
    expect(people).toHaveLength(3);
    expect(people[0].knownas).toBe("John F Kennedy");
    expect(people[1].knownas).toBe("Lee Harvey Oswald");
    expect(people[2].knownas).toBe("Arthur Young");
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

    expect(rv[0].Subject.knownas).toBe('John F Kennedy');
    expect(rv[0].Object.knownas).toBe('Lee Harvey Oswald');
    expect(rv[0].Verb.name).toBe('assassinates');
    expect(rv[0].start).toBeDate('1963-11-22');
    expect(rv[0].end).toBeDate('1963-11-22');

    expect(rv[1].Subject.knownas).toBe('Arthur Young');
    expect(rv[1].Object.knownas).toBe('Lee Harvey Oswald');
    expect(rv[1].Verb.name).toBe('hosts');
    expect(rv[1].start).toBeDate('1963-11-21');
    expect(rv[1].end).toBeDate('1963-11-22');
  });
});


