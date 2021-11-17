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
  console.dir(fixtures, { depth: null });

  await prisma.person.deleteMany({
    where: {
      OR: [
        { id: fixtures.jfk.id },
        { id: fixtures.arthur.id },
      ]
    }
  });
  await prisma.$disconnect();
}
