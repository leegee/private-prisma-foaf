import { Entity, Predicate, Prisma, PrismaClient, Verb } from "@prisma/client";
import { logger, ILogger } from 'src/service/logger';

export class EntityNotFoundError extends Error {
  constructor(message: string) {
    super(`No such entity knownas "${message}".`);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}

export interface IDaoArgs {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  logger?: ILogger;
}


export type SimplePredicate = {
  Subject: Entity,
  Verb: Verb,
  Object: Entity,
}

export type PredicateResult = SimplePredicate & Predicate;

export class DAO {
  logger: ILogger;
  entityKnownas2Id: { [key: string]: number } = {};
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  constructor({ prisma, logger: _logger }: IDaoArgs) {
    this.logger = _logger || logger;
    this.prisma = prisma;
  }

  async getAllPredicates(): Promise<PredicateResult[]> {
    return await this.prisma.predicate.findMany({
      include: {
        Subject: true,
        Object: true,
        Verb: true
      }
    });
  }

  async getPredicatesByKnownAs(knownasInput: string | string[]): Promise<PredicateResult[]> {
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

      this.logger.debug(`getPredicatesByKnownAs for "${knownasList[knownasListIndex]}", entityId = "${this.entityKnownas2Id[knownasList[knownasListIndex]]}"`);

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

