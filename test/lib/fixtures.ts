import { PrismaClient } from '@prisma/client';
import { logger } from 'src/logger';

export const prisma = new PrismaClient({
  log: ['warn', 'error'], // 'query', 'info', 'warn', 'error'],
});

export interface IFixtures {
  [key: string]: any
}

export async function setup(): Promise<IFixtures> {
  logger.debug('SETUP fixtures');

  const fixtures: IFixtures = {};

  fixtures.assassinated = await prisma.verb.findFirst({
    where: { name: 'assassinated' }
  });

  fixtures.hosted = await prisma.verb.findFirst({
    where: { name: 'hosted' }
  });

  fixtures.heads = await prisma.verb.findFirst({
    where: { name: 'heads' }
  });

  fixtures.bell = await prisma.entity.findFirst({
    where: {
      knownas: 'bell',
      formalname: 'Bell Aereospace'
    }
  });

  fixtures.cia = await prisma.entity.findFirst({
    where: {
      knownas: 'cia',
      formalname: 'Central Intelligence Agency'
    }
  });

  fixtures.jfk = await prisma.entity.findFirst({
    where: { knownas: 'JFK', formalname: 'John F Kennedy' },
  });

  fixtures.oswald = await prisma.entity.findFirst({
    where: { knownas: 'Oswald', formalname: 'Lee Harvey Oswald' },
  });

  fixtures.arthur = await prisma.entity.findFirst({
    where: {
      knownas: 'Arthur Young',
      formalname: 'Arthur M Young',
      dob: new Date('1905-11-03'),
      dod: new Date('1995-05-30')
    }
  });

  fixtures.jfkHeadsCia = await prisma.action.findFirst({
    where: {
      verbId: fixtures.heads.id,
      subjectId: fixtures.jfk.id,
      objectId: fixtures.cia.id,
      start: new Date('1961-01-20'),
      end: new Date('1963-11-22'),
    },
  });

  fixtures.oswaldassassinatedJfk = await prisma.action.findFirst({
    where: {
      verbId: fixtures.assassinated.id,
      subjectId: fixtures.oswald.id,
      objectId: fixtures.jfk.id,
      start: new Date('1963-11-22'),
      end: new Date('1963-11-22'),
    },
  });

  fixtures.arthurhostedOswald = await prisma.action.findFirst({
    where: {
      verbId: fixtures.hosted.id,
      subjectId: fixtures.arthur.id,
      objectId: fixtures.oswald.id,
      start: new Date('1963-11-21'),
      end: new Date('1963-11-22'),
    },
  });

  return fixtures;
}

