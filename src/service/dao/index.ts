import nlp from 'compromise';
import { Entity, Predicate, Prisma, PrismaClient, Verb } from '@prisma/client';
import { logger, ILogger } from 'src/service/logger';
import { Wordnet, IndexEntry, Sense } from 'wordnet-binary-search';

Wordnet.dataDir = 'assets/wordnet/';
export interface Iknownas2id {
  [key: string]: number;
}

export interface Iknownas2boolean {
  [key: string]: boolean;
}

export interface IInterable {
  [key: string]: string | undefined;
}
export interface IEntityUpsertArgs extends IInterable {
  knownas: string;
  formalname: string;
  givenname?: string;
  middlenames?: string;
  familyname?: string;
  dob?: string;
  dod?: string;
}

export interface IPredicateUpsertArgs {
  Subject: string,
  Verb: string,
  Object: string,
  Citations?: string[];
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

const wordnet = new Wordnet();

export function normaliseVerb(subject: string): string {
  if (typeof subject === 'undefined') {
    throw new TypeError('prepareVerb requires a string');
  }

  const n = normaliseEntity(subject);

  // Todo: Middleware
  return nlp(n).verbs().toInfinitive().text() || n;
}

export function normaliseArray(list: string[]): string[] {
  return list.map(subject => normaliseEntity(subject));
}

export function normaliseEntity(subject: string): string {
  if (typeof subject === 'undefined') {
    throw new TypeError('normalise requires a string');
  }
  return subject.toLowerCase().replace(/[^\w\s'-]+/, '').replace(/\s+/gs, ' ').trim()
}

export function makePredicateId(subjectId: number, verbId: number, objectId: number): string {
  return [subjectId, verbId, objectId].join('-');
}

export class GrammarError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, GrammarError.prototype);
  }
}

export class EntityNotFoundError extends Error {
  constructor(message: string) {
    super(`No such entity knownas '${message}'.`);
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

export type SimplePredicateInput = {
  Subject: string,
  Verb: string,
  Object: string,
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

  hypernym(verb: string): string {
    const indexEntry = Wordnet.find(verb, 'v');
    const senses = (indexEntry && (indexEntry as any).senses) || undefined;
    const rv = senses && senses[0].word || verb;
    this.logger.debug(`hypernym for '${verb}' is '${rv}'`);
    return normaliseVerb(rv);
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
        knownasList[knownasListIndex] = normaliseEntity(knownasList[knownasListIndex]).toLowerCase();
      }

      if (!this.entityKnownas2Id[knownasList[knownasListIndex]]) {
        const knownasEntity = await this.prisma.entity.findFirst({
          where: { knownas: knownasInput[knownasListIndex] },
          select: { id: true },
        });

        if (!!!knownasEntity) {
          throw new EntityNotFoundError(knownasList[knownasListIndex]);
        }

        this.entityKnownas2Id[knownasList[knownasListIndex]] = knownasEntity.id;
      }

      this.logger.debug(`getPredicatesByKnownAs for '${knownasList[knownasListIndex]}', entityId = '${this.entityKnownas2Id[knownasList[knownasListIndex]]}'`);

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
    target = normaliseEntity(target);
    this.logger.debug(`entitySearch for '${target}'`);
    return await this.prisma.entity.findMany({
      where: {
        OR: [
          { knownas: { search: target, mode: 'insensitive', } },
          { formalname: { search: target, mode: 'insensitive', } },
        ],
      }
    });
  }

  async verbSearch(input: string): Promise<Verb[]> {
    const target = normaliseVerb(input);
    const hypernym = this.hypernym(target);

    this.logger.debug(`verbSearch for '${input}' as '${target}'`);

    return await this.prisma.verb.findMany({
      where: {
        OR: [
          { name: { search: normaliseVerb(target), mode: 'insensitive', } },
          { hypernym: { search: hypernym } },
        ]
      },
    });
  }

  async createEntity(row: IEntityUpsertArgs) {
    this.logger.debug('_createEntity for row:', row);

    const entity: { [key: string]: string } = {};

    for (const key in row) {
      if (typeof row[key] !== 'undefined' && row[key]!.length) {
        // TODO Middleare
        const match = row[key]!.match(/^\s*(\d{4}-\d{2}-\d{2})/);
        if (match !== null) {
          entity[key] = new Date(match[1]).toISOString();
        } else {
          entity[key] = normaliseEntity(row[key]!);
          if (entity[key].length === 0) {
            delete entity[key];
          }
        }
      }
    }

    try {
      await this.prisma.entity.upsert({
        create: entity as IEntityUpsertArgs,
        update: entity as IEntityUpsertArgs,
        where: {
          knownas: entity.knownas as string,
        }
      });
    } catch (e) {
      this.logger.debug({ subject: entity });
      this.logger.error(e);
    }
  }

  /**
   * Enties and verbs may not yet exist.
   */
  async createPredicate(row: IPredicateUpsertArgs) {
    this.logger.debug('_createSubjectObjectVerbPredicate for row:', row);

    if (!row || !row.Subject || !row.Verb || !row.Object) {
      throw new GrammarError(JSON.stringify(row, null, 2));
    }

    const subject = normaliseEntity(row.Subject);
    const verb = normaliseVerb(row.Verb);
    const object = normaliseEntity(row.Object);

    const foundSubject = CachedIds.Entity[subject]
      ? {
        id: CachedIds.Entity[subject],
        knownas: row.Subject
      }
      : await this.prisma.entity.upsert({
        select: { id: true },
        where: { knownas: subject },
        create: {
          knownas: subject,
          formalname: subject,
        },
        update: {
        },
      });

    CachedIds.Entity[subject] = foundSubject.id;

    this.logger.debug(`Got subject '${JSON.stringify(foundSubject)}' via '${row.Subject}'`,);

    const foundVerb = CachedIds.Verb[verb]
      ? {
        id: CachedIds.Verb[verb],
        name: row.Verb
      }
      : await this.prisma.verb.upsert({
        select: { id: true },
        where: { name: verb },
        create: {
          name: verb,
          hypernym: this.hypernym(verb),
        },
        update: {
        },
      });

    CachedIds.Verb[verb] = foundVerb.id;

    this.logger.debug(`Got verb '${JSON.stringify(foundVerb)}' via '${row.Verb}'`,);

    const foundObject = CachedIds.Entity[object]
      ? {
        id: CachedIds.Entity[object],
        knownas: row.Object
      }
      : await this.prisma.entity.upsert({
        select: { id: true },
        where: { knownas: object },
        create: {
          knownas: object,
          formalname: object,
        },
        update: {
        },
      });

    CachedIds.Entity[object] = foundObject.id;

    this.logger.debug(`Got object '${JSON.stringify(foundObject)}' via '${row.Object}'`,);

    const predicateId = makePredicateId(
      foundSubject.id,
      foundVerb.id,
      foundObject.id,
    );

    if (CachedIds.Predicate[predicateId]) {
      this.logger.debug(`Predicate found in cache - '${predicateId}' for: ${row.Subject} ${row.Verb} ${row.Object} `,);
    }

    else {
      const msg = `predicateId '${predicateId}' for '${row.Subject} ${row.Verb} ${row.Object}'`;

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

