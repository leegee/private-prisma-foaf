import { Prisma, PrismaClient } from '@prisma/client';

const LOG_LEVELS: Prisma.LogLevel[] = ['query', 'error', 'info', 'warn'];

export const prisma = new PrismaClient({
  log: LOG_LEVELS.map((level) => {
    return { emit: 'stdout', level } as Prisma.LogDefinition
  })
});

