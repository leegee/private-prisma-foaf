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
    data: { fullname: 'John F Kennedy', },
  });

  const oswald = await prisma.person.create({
    data: { fullname: 'Lee Harvey Oswald', },
  });

  const arthur = await prisma.person.create({
    data: { fullname: 'Arthur Young', },
  });

  await prisma.relations.create({
    data: {
      verbId: assassinates.id,
      subjectId: jfk.id,
      objectId: oswald.id,
    },
  });

  await prisma.relations.create({
    data: {
      verbId: hosts.id,
      subjectId: arthur.id,
      objectId: oswald.id,
    },
  });
});

afterAll(async () => {
  await prisma.relations.deleteMany();
  await prisma.verb.deleteMany();
  await prisma.person.deleteMany();
  await prisma.$disconnect();
});


describe('Initial scheme', () => {
  it('has people', async () => {
    const allUsers = await prisma.person.findMany();
    expect(allUsers).toHaveLength(3);
    expect(allUsers[0].fullname).toBe("John F Kennedy");
    expect(allUsers[1].fullname).toBe("Lee Harvey Oswald");
    expect(allUsers[2].fullname).toBe("Arthur Young");
  });

  it('has people with relations', async () => {
    const rv = await prisma.relations.findMany({
      select: {
        Subject: true,
        Object: true,
        Verb: true
      }
    });

    expect(rv).toHaveLength(2);

    expect(rv[0].Subject.fullname).toBe('John F Kennedy');
    expect(rv[0].Object.fullname).toBe('Lee Harvey Oswald');
    expect(rv[0].Verb.name).toBe('assassinates');

    expect(rv[1].Subject.fullname).toBe('Arthur Young');
    expect(rv[1].Object.fullname).toBe('Lee Harvey Oswald');
    expect(rv[1].Verb.name).toBe('hosts');
  });
});


