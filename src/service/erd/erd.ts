/**
 * Renders an ERD of the predicates
 */

import * as path from 'path';
import fs from 'fs';
import os from 'os';
import { PrismaClient, Prisma, Entity, Verb, Predicate } from '@prisma/client';
import { logger, ILogger } from 'src/service/logger';
import { DAO, PredicateResult } from 'src/service/dao';

export function normaliseArray(list: string[]): string[] {
  return list.map(subject => normalise(subject));
}

export function normalise(subject: string): string {
  return subject.toLowerCase().replace(/[^\w\s'-]+/, '').replace(/\s+/gs, ' ').trim()
}

export function makePredicateId(subjectId: number, verbId: number, objectId: number): string {
  return [subjectId, verbId, objectId].join('-');
}


export interface IErdArgs {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  savepath?: string;
  logger?: ILogger;
  format?: string;
  dao?: DAO;
}

export class Erd {
  logger: ILogger;
  dao: DAO;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  predicates: PredicateResult[] = []; // TODO types
  savepath: string = 'erd-output.svg';
  tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'entity-erd-');
  format = '';

  constructor({ prisma, savepath, logger: _logger, format, dao }: IErdArgs) {
    this.prisma = prisma;
    if (!!dao) {
      this.dao = dao;
    } else {
      this.dao = new DAO({ prisma, logger });
    }
    if (!!savepath) {
      this.savepath = savepath;
    }
    if (this.savepath.length < 5) {
      throw new TypeError('savepath too short');
    }
    this.format = format || this.savepath.substr(this.savepath.length - 3, 3);
    this.logger = _logger || logger;
  }

  reset(): void {
    this.predicates = [];
  }

  async getPredicates(knownas?: string | string[]) {
    let predicates: PredicateResult[] = [];

    if (!!knownas) {
      const subject = knownas instanceof Array ? normaliseArray(knownas) : normalise(knownas);
      predicates = await this.dao.getPredicatesByKnownAs(subject);
    }

    else {
      predicates = await this.dao.getAllPredicates();
    }

    this.predicates.push(...predicates);

    if (this.predicates.length === 0) {
      throw new Error(`No predicates to graph for "${knownas || 'all'}"`);
    }

    this.logger.debug(`_getPredicates exits with ${this.predicates.length} predicates.`);
  }

}
