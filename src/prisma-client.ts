import { PrismaClient } from '@prisma/client';

import { TypeConversion } from 'src/prisma-middleware/type-conversion';

export const prisma = new PrismaClient({
  log: ['warn', 'error'], // 'query', 'info', 'warn', 'error'],
});


prisma.$use(TypeConversion);
