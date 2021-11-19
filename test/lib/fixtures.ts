import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface IFixtures {
  [key: string]: any
}

let fixtures: IFixtures = {};

export async function setup(): Promise<IFixtures> {
  // await prisma.$queryRaw`BEGIN`;

  fixtures = {};

  fixtures.assassinated = await prisma.verb.create({
    data: { name: 'assassinated' }
  });

  fixtures.hosted = await prisma.verb.create({
    data: { name: 'hosted' }
  });

  fixtures.heads = await prisma.verb.create({
    data: { name: 'heads' }
  });

  fixtures.bell = await prisma.entity.create({
    data: {
      knownas: 'bell',
      formalname: 'Bell Aereospace'
    }
  });

  fixtures.cia = await prisma.entity.create({
    data: {
      knownas: 'cia',
      formalname: 'Central Intelligence Agency'
    }
  });

  fixtures.jfk = await prisma.entity.create({
    data: { knownas: 'JFK', formalname: 'John F Kennedy' },
  });

  fixtures.oswald = await prisma.entity.create({
    data: { knownas: 'Oswald', formalname: 'Lee Harvey Oswald' },
  });

  fixtures.arthur = await prisma.entity.create({
    data: {
      knownas: 'Arthur Young',
      formalname: 'Arthur M Young',
      dob: new Date('1905-11-03'),
      dod: new Date('1995-05-30')
    }
  });

  fixtures.jfkHeadsCia = await prisma.action.create({
    data: {
      verbId: fixtures.heads.id,
      subjectId: fixtures.jfk.id,
      objectId: fixtures.cia.id,
      start: new Date('1961-01-20'),
      end: new Date('1963-11-22'),
    },
  });

  fixtures.oswaldassassinatedJfk = await prisma.action.create({
    data: {
      verbId: fixtures.assassinated.id,
      subjectId: fixtures.oswald.id,
      objectId: fixtures.jfk.id,
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
  await prisma.$disconnect();
}
