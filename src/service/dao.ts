import { Entity, Predicate, Prisma, PrismaClient, Verb } from "@prisma/client";
import { logger, ILogger } from 'src/service/logger';
import { normalise as sanitise, makePredicateId } from "src/service/erd/erd";

export interface Iknownas2id {
  [key: string]: number;
}

export interface Iknownas2boolean {
  [key: string]: boolean;
}

export interface IEntityUpsertArgs {
  [key: string]: string | undefined;
  knownas: string;
  formalname: string;
  givenname?: string;
  middlenames?: string;
  familyname?: string;
  dob?: string;
  dod?: string;
}

export interface IPredicateUpsertArgs {
  Subject: string;
  Verb: string;
  Object: string;
  Comment?: string;
  start?: string;
  end?: string;
}

export interface ICache {
  Entity: Iknownas2id;
  Verb: Iknownas2id;
  Predicate: Iknownas2boolean;
}

const CachedIds: ICache = {
  Entity: {},
  Verb: {},
  Predicate: {},
};

export class GrammarError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, GrammarError.prototype);
  }
}

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
      } else {
        knownasList[knownasListIndex] = sanitise(knownasList[knownasListIndex]).toLowerCase();
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

  async entitySearch(target: string): Promise<Entity[]> {
    target = sanitise(target);
    return await this.prisma.entity.findMany({
      where: {
        OR: [
          { knownas: { contains: target } },
          { formalname: { contains: target } },
        ],
      }
    });
  }

  async verbSearch(target: string): Promise<Verb[]> {
    target = sanitise(target).toLowerCase()
    return await this.prisma.verb.findMany({
      where: { name: { contains: target } },
    });
  }

  async createPredicate(userInput: SimplePredicate) {
    // userInput = normalise(userInput);
    const rv = await this.prisma.predicate.create({
      data: userInput
    });
    this.logger.debug('XXXXXXXXXXXXXXXX', rv);
    return rv;
  }




  async _createEntity(row: IEntityUpsertArgs) {
    this.logger.debug('_createEntity for row:', row);

    const subject: { [key: string]: string | Date } = {};

    for (const key in row) {
      if (typeof row[key] !== 'undefined' && row[key]!.length) {
        // TODO Middleare
        if (row[key]!.match(/^\d{4}-\d{2}-\d{2}/)) {
          subject[key] = new Date(subject[key]);
        } else {
          subject[key] = sanitise(row[key]!);
          if (subject[key].toString().length === 0) {
            delete subject[key];
          }
        }
      }
    }

    const args = {
      create: subject as IEntityUpsertArgs,
      update: subject as IEntityUpsertArgs,
      where: {
        knownas: subject.knownas as string,
      }
    };
    try {
      await this.prisma.entity.upsert(args);
    } catch (e) {
      this.logger.error(e, args);
    }
  }

  async _createSubjectObjectVerbPredicate(row: IPredicateUpsertArgs) {
    this.logger.debug('_createSubjectObjectVerbPredicate for row:', row);

    if (!row || !row.Subject || !row.Verb || !row.Object) {
      throw new GrammarError(JSON.stringify(row, null, 2));
    }

    row.Subject = sanitise(row.Subject);
    row.Verb = sanitise(row.Verb);
    row.Object = sanitise(row.Object);

    const foundSubject = CachedIds.Entity[row.Subject]
      ? {
        id: CachedIds.Entity[row.Subject],
        knownas: row.Subject
      }
      : await this.prisma.entity.upsert({
        select: { id: true },
        where: { knownas: row.Subject },
        create: {
          knownas: row.Subject,
          formalname: row.Subject,
        },
        update: {
          knownas: row.Subject,
          formalname: row.Subject,
        },
      });

    CachedIds.Entity[row.Subject] = foundSubject.id;

    this.logger.debug(`Got subject "${JSON.stringify(foundSubject)}" via "${row.Subject}"`,);

    const foundVerb = CachedIds.Verb[row.Verb]
      ? {
        id: CachedIds.Verb[row.Verb],
        name: row.Verb
      }
      : await this.prisma.verb.upsert({
        select: { id: true },
        where: { name: row.Verb },
        create: {
          name: row.Verb
        },
        update: {
          name: row.Verb
        },
      });

    CachedIds.Verb[row.Verb] = foundVerb.id;

    this.logger.debug(`Got verb "${JSON.stringify(foundVerb)}" via "${row.Verb}"`,);

    const foundObject = CachedIds.Entity[row.Object]
      ? {
        id: CachedIds.Entity[row.Object],
        knownas: row.Object
      }
      : await this.prisma.entity.upsert({
        select: { id: true },
        where: { knownas: row.Object },
        create: {
          knownas: row.Object,
          formalname: row.Object,
        },
        update: {
          knownas: row.Object,
          formalname: row.Object,
        },
      });

    CachedIds.Entity[row.Object] = foundObject.id;

    this.logger.debug(`Got object "${JSON.stringify(foundObject)}" via "${row.Object}"`,);

    const predicateId = makePredicateId(
      foundSubject.id,
      foundVerb.id,
      foundObject.id,
    );

    if (CachedIds.Predicate[predicateId]) {
      this.logger.debug(`Predicate found in cache - "${predicateId}" for: ${row.Subject} ${row.Verb} ${row.Object} `,);
    }

    else {
      const msg = `predicateId "${predicateId}" for "${row.Subject} ${row.Verb} ${row.Object}"`;

      try {
        await this.prisma.predicate.upsert({
          where: {
            subjectId_objectId_verbId: {
              subjectId: foundSubject.id as number,
              verbId: foundVerb.id as number,
              objectId: foundObject.id as number
            }
          },
          create: {
            Subject: {
              connect: { id: foundSubject.id as number }
            },
            Verb: {
              connect: { id: foundVerb.id as number },
            },
            Object: {
              connect: { id: foundObject.id as number },
            },
            start: row.start ? new Date(row.start) : null, // should middleawre handle this?
            end: row.end ? new Date(row.end) : null,
          },
          update: {
            subjectId: foundSubject.id as number,
            verbId: foundVerb.id as number,
            objectId: foundObject.id as number,
            start: row.start ? new Date(row.start) : null, // should middleawre handle this?
            end: row.end ? new Date(row.end) : null,
          },
        });

        CachedIds.Predicate[predicateId] = true;
        this.logger.debug(`OK: ${msg}`);
      }

      catch (e) {
        this.logger.error(`Failed to create ${msg}`);
        this.logger.error(e);
      }
    }

  }

}

