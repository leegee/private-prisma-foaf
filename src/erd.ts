import { Person, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function erd(person: Person) {

  const rv = await prisma.action.findMany({
    select: {
      start: true,
      end: true,
      Subject: true,
      Object: true,
      Verb: true,
    }
  });

}