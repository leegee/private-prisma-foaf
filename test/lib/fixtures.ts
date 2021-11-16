import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function setup(testId: string) {
  const fixtures = {} as any;

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

  // https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#create-a-new-profile-record-then-connect-it-to-an-existing-user-record-or-create-a-new-user
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

export async function teardown(fixtures: {}) {
  await prisma.action.deleteMany();
  await prisma.verb.deleteMany();
  await prisma.person.deleteMany();
  await prisma.$disconnect();
}
