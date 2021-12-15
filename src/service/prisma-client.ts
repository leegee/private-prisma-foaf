import { Prisma, PrismaClient } from '@prisma/client';

const LOG_LEVELS: Prisma.LogLevel[] =
  process.env.LOG_LEVEL == 'debug' ? ['query', 'error', 'info', 'warn'] : ['error', 'warn'];

export const prisma = new PrismaClient({
  // log: LOG_LEVELS.map((level) => { return { emit: 'stdout', level } as Prisma.LogDefinition })
  log: LOG_LEVELS
});

