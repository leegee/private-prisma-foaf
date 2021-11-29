import util from 'util';
import { Prisma } from '@prisma/client';
import { logger } from 'src/logger';

export const TypeConversion: Prisma.Middleware = async (params: Prisma.MiddlewareParams, next) => {
  if (params.action == 'create') {
  }
  logger.info(util.inspect(params), '<<<');
  return await next(params)
}