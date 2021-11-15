import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  const assassin = await prisma.verb.create({
    data: { name: 'assassin' }
  });

  const jfk = await prisma.person.create({
    data: { fullname: 'John F Kennedy', },
  });

  const oswald = await prisma.person.create({
    data: { fullname: 'Lee Harvey Oswald', },
  });


});

afterAll(async () => {
  await prisma.person.deleteMany();
  await prisma.verb.deleteMany();
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
});


