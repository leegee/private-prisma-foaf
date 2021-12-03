import { Prisma, PrismaClient } from '@prisma/client';
import { Value } from '@prisma/client/runtime';
import * as loggerModule from 'src/service/logger';
import { DAO, IEntityUpsertArgs, IPredicateUpsertArgs } from '../dao';

// prisma.$use(async (params, next) => {
// const before = process.hrtime.bigint;
//   const result = await next(params);
//   const after =  process.hrtime.bigint;
//   logger.debug(
//     `Query ${params.model}.${params.action} took ${after - before}ms`,
//   );
//   return result;
// })


export type ConfigType = {
  [key: string]: Value;
}

export interface IBaseingestorArgs {
  logger?: loggerModule.ILogger;
  dao: DAO;
}

export class BaseIngestor {
  logger: loggerModule.ILogger;
  dao: DAO;

  constructor({ logger, dao }: IBaseingestorArgs) {
    this.dao = dao;
    this.logger = logger
      ? (logger as loggerModule.ILogger)
      : loggerModule.logger;
  }

  async _createEntity(row: IEntityUpsertArgs) {
    this.logger.debug('_createEntity for row:', row);
    return this.dao._createEntity(row);
  }

  async _createSubjectObjectVerbPredicate(row: IPredicateUpsertArgs) {
    this.logger.debug('_createSubjectObjectVerbPredicate for row:', row);
    return this.dao._createSubjectObjectVerbPredicate(row);
  }

}
