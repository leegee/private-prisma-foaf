import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export interface IFixtures {
  [key: string]: any
}

let fixtures: IFixtures = {};

export async function setup(testId: string): Promise<IFixtures> {
  fixtures.assassinates = await prisma.verb.create({
    data: { name: 'assassinates' + testId }
  });

  fixtures.hosts = await prisma.verb.create({
    data: { name: 'hosts' + testId }
  });

  fixtures.jfk = await prisma.person.create({
    data: { knownas: 'John F Kennedy' + testId },
  });

  fixtures.oswald = await prisma.person.create({
    data: { knownas: 'Lee Harvey Oswald' + testId },
  });

  fixtures.arthur = await prisma.person.create({
    data: { knownas: 'Arthur Young' + testId },
  });

  fixtures.oswaldAssassinatesJfk = await prisma.action.create({
    data: {
      verbId: fixtures.assassinates.id,
      subjectId: fixtures.jfk.id,
      objectId: fixtures.oswald.id,
      start: new Date('1963-11-22'),
      end: new Date('1963-11-22'),
    },
  });

  fixtures.arthurHostsOswald = await prisma.action.create({
    data: {
      verbId: fixtures.hosts.id,
      subjectId: fixtures.arthur.id,
      objectId: fixtures.oswald.id,
      start: new Date('1963-11-21'),
      end: new Date('1963-11-22'),
    },
  });

  return fixtures;
}

export async function teardown() {
  // await prisma.action.deleteMany({
  //   where: {
  //     OR: [{
  //       verbId: fixtures.assassinates.id,
  //       subjectId: fixtures.jfk.id,
  //       objectId: fixtures.oswald.id,
  //     }, {
  //       verbId: fixtures.hosts.id,
  //       subjectId: fixtures.arthur.id,
  //       objectId: fixtures.oswald.id,
  //     }]
  //   }
  // });

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
        { id: fixtures.assassinates.id },
        { id: fixtures.hosts.id },
      ]
    }
  });

  await prisma.$disconnect();
}
