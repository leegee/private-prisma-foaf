import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface IFixtures {
  [key: string]: any
}

let fixtures: IFixtures = {};

export async function setup(testId: string): Promise<IFixtures> {

  fixtures[testId] = {} as IFixtures;

  fixtures[testId].assassinates = await prisma.verb.create({
    data: { name: 'assassinates' + testId }
  });

  fixtures[testId].hosts = await prisma.verb.create({
    data: { name: 'hosts' + testId }
  });

  fixtures[testId].jfk = await prisma.person.create({
    data: { knownas: 'John F Kennedy' + testId },
  });

  fixtures[testId].oswald = await prisma.person.create({
    data: { knownas: 'Lee Harvey Oswald' + testId },
  });

  fixtures[testId].arthur = await prisma.person.create({
    data: { knownas: 'Arthur Young' + testId },
  });

  fixtures[testId].oswaldAssassinatesJfk = await prisma.action.create({
    data: {
      verbId: fixtures[testId].assassinates.id,
      objectId: fixtures[testId].jfk.id,
      subjectId: fixtures[testId].oswald.id,
      start: new Date('1963-11-22'),
      end: new Date('1963-11-22'),
    },
  });

  fixtures[testId].arthurHostsOswald = await prisma.action.create({
    data: {
      verbId: fixtures[testId].hosts.id,
      objectId: fixtures[testId].arthur.id,
      subjectId: fixtures[testId].oswald.id,
      start: new Date('1963-11-21'),
      end: new Date('1963-11-22'),
    },
  });

  return fixtures[testId];
}

export async function teardown(testId: string) {
  // await prisma.action.deleteMany({
  //   where: {
  //     OR: [{
  //       verbId: fixtures[testId].assassinates.id,
  //       subjectId: fixtures[testId].jfk.id,
  //       objectId: fixtures[testId].oswald.id,
  //     }, {
  //       verbId: fixtures[testId].hosts.id,
  //       subjectId: fixtures[testId].arthur.id,
  //       objectId: fixtures[testId].oswald.id,
  //     }]
  //   }
  // });

  await prisma.person.deleteMany({
    where: {
      OR: [
        { id: fixtures[testId].jfk.id },
        { id: fixtures[testId].arthur.id },
        { id: fixtures[testId].oswald.id },
      ]
    }
  });

  await prisma.verb.deleteMany({
    where: {
      OR: [
        { id: fixtures[testId].assassinates.id },
        { id: fixtures[testId].hosts.id },
      ]
    }
  });

  await prisma.$disconnect();
}
