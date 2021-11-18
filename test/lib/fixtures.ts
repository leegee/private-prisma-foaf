import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface IFixtures {
  [key: string]: any
}

let fixtures: IFixtures = {};

export async function setup(): Promise<IFixtures> {
  // await prisma.$queryRaw`BEGIN`;

  fixtures = {} as IFixtures;

  fixtures.assassinated = await prisma.verb.create({
    data: { name: 'assassinated' }
  });

  fixtures.hosted = await prisma.verb.create({
    data: { name: 'hosted' }
  });

  fixtures.jfk = await prisma.person.create({
    data: { knownas: 'John F Kennedy' },
  });

  fixtures.oswald = await prisma.person.create({
    data: { knownas: 'Lee Harvey Oswald' },
  });

  fixtures.arthur = await prisma.person.create({
    data: { knownas: 'Arthur Young' },
  });

  fixtures.oswaldassassinatedJfk = await prisma.action.create({
    data: {
      verbId: fixtures.assassinated.id,
      objectId: fixtures.jfk.id,
      subjectId: fixtures.oswald.id,
      start: new Date('1963-11-22'),
      end: new Date('1963-11-22'),
    },
  });

  fixtures.arthurhostedOswald = await prisma.action.create({
    data: {
      verbId: fixtures.hosted.id,
      subjectId: fixtures.arthur.id,
      objectId: fixtures.oswald.id,
      start: new Date('1963-11-21'),
      end: new Date('1963-11-22'),
    },
  });

  return fixtures;
}

export async function teardown() {
  // await prisma.$queryRaw`ROLLBACK`;

  await prisma.person.deleteMany({
    where: {
      OR: [
        { id: fixtures.jfk.id },
        { id: fixtures.arthur.id },
        { id: fixtures.oswald.id },
      ]
    }
  });

  await prisma.verb.deleteMany({
    where: {
      OR: [
        { id: fixtures.assassinated.id },
        { id: fixtures.hosted.id },
      ]
    }
  });

  await prisma.$disconnect();
}
