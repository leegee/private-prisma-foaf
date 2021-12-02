/**
 * Renders an ERD of the predicates
 */

import * as path from 'path';
import fs from 'fs';
import os from 'os';
import { PrismaClient, Prisma, Entity, Verb, Predicate } from '@prisma/client';
import { logger, ILogger } from 'src/service/logger';

export function normaliseArray(list: string[]): string[] {
  return list.map(subject => normalise(subject));
}

export function normalise(subject: string): string {
  return subject.toLowerCase().replace(/[^\w\s'-]+/, '').replace(/\s+/gs, ' ').trim()
}

export function makePredicateId(subjectId: number, verbId: number, objectId: number): string {
  return [subjectId, verbId, objectId].join('-');
}

export type SimplePredicate = {
  Subject: Entity,
  Verb: Verb,
  Object: Entity,
}

export type PredicateResult = SimplePredicate & Predicate;

export class EntityNotFoundError extends Error {
  constructor(message: string) {
    super(`No such entity knownas "${message}".`);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
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
}

export class Erd {
  logger: ILogger;

  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  predicates: PredicateResult[] = []; // TODO types
  savepath: string = 'erd-output.svg';
  entityKnownas2Id: { [key: string]: number } = {};
  tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'entity-erd-');
  format = '';

  constructor({ prisma, savepath, logger: _logger, format }: IErdArgs) {
    this.prisma = prisma;
    if (!!savepath) {
      this.savepath = savepath;
    }
    if (this.savepath.length < 5) {
      throw new TypeError('savepath too short');
    }
    this.format = format || this.savepath.substr(this.savepath.length - 3, 3);
    this.logger = _logger ? _logger : logger;
  }

  reset(): void {
    this.predicates = [];
  }

  async getPredicates(knownas?: string | string[]) {
    let predicates: PredicateResult[] = [];

    if (!!knownas) {
      const subject = knownas instanceof Array ? normaliseArray(knownas) : normalise(knownas);
      predicates = await this._getPredicatesByKnownAs(subject);
    }

    else {
      predicates = await this._getAllPredicates();
    }

    this.predicates.push(...predicates);

    if (this.predicates.length === 0) {
      throw new Error(`No predicates to graph for "${knownas || 'all'}"`);
    }

    this.logger.debug(`_getPredicates exits with ${this.predicates.length} predicates.`);
  }

  async _getAllPredicates(): Promise<PredicateResult[]> {
    return await this.prisma.predicate.findMany({
      include: {
        Subject: true,
        Object: true,
        Verb: true
      }
    });
  }

  async _getPredicatesByKnownAs(knownasInput: string | string[]): Promise<PredicateResult[]> {
    const knownasList = knownasInput instanceof Array ? knownasInput : [knownasInput];
    let predicates: PredicateResult[] = [];

    for (let knownasListIndex = 0; knownasListIndex < knownasList.length; knownasListIndex++) {
      if (knownasList[knownasListIndex] === undefined) {
        throw new TypeError('Called without .knownas');
      }

      if (!this.entityKnownas2Id[knownasList[knownasListIndex]]) {
        const knownasEntity = await this.prisma.entity.findFirst({
          where: { knownas: knownasList[knownasListIndex] },
          select: { id: true },
        });

        if (knownasEntity === null) {
          throw new EntityNotFoundError(knownasList[knownasListIndex]);
        }

        this.entityKnownas2Id[knownasList[knownasListIndex]] = knownasEntity.id;
      }

      this.logger.debug(`._getPredicatesByKnownAs for "${knownasList[knownasListIndex]}", entityId = "${this.entityKnownas2Id[knownasList[knownasListIndex]]}"`);

      const somePredicates = await this.prisma.predicate.findMany({
        where: {
          OR: [
            { objectId: this.entityKnownas2Id[knownasList[knownasListIndex]] },
            { subjectId: this.entityKnownas2Id[knownasList[knownasListIndex]] },
          ],
        },
        include: {
          Subject: true,
          Object: true,
          Verb: true,
        },
      });

      predicates.push(...somePredicates);

    }
    return predicates;
  }

}
