import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  const assassinate = await prisma.verb.create({
    data: { name: 'assassinate' }
  });

  const jfk = await prisma.person.create({
    data: { fullname: 'John F Kennedy', },
  });

  const oswald = await prisma.person.create({
    data: { fullname: 'Lee Harvey Oswald', },
  });

  const relation = await prisma.relations.create({
    data: {
      verbId: assassinate.id,
      objectId: jfk.id,
      subjectId: oswald.id,
    },
  });
});

afterAll(async () => {
  await prisma.relations.deleteMany();
  await prisma.verb.deleteMany();
  await prisma.person.deleteMany();
  await prisma.$disconnect()
});


describe('Initial scheme', () => {
  it('has people', async () => {
    const allUsers = await prisma.person.findMany();
    expect(allUsers).toEqual([
      {
        "fullname": "John F Kennedy",
        "id": 1,
        "published": false,
      },
      {
        "fullname": "Lee Harvey Oswald",
        "id": 2,
        "published": false,
      },
    ])
  });

  it('has people with relations', async () => {
    const allUsers = await prisma.person.findMany({
      include: {
        Friends: {
          include: {
            Verb: true
          }
        }
      }
    });

    console.dir(allUsers, { depth: null });

    expect(allUsers).toEqual([
      {
        "fullname": "John F Kennedy",
        "id": 1,
        "published": false,
      },
      {
        "fullname": "Lee Harvey Oswald",
        "id": 2,
        "published": false,
      },
    ])
  });
});


