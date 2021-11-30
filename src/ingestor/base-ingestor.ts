import { Prisma, PrismaClient } from '@prisma/client';
import * as loggerModule from 'src/logger';
import { normalise, makePredicateId } from 'src/erd/erd';

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
  [key: string]: any
  spreadsheetId: string | undefined,
  googlesheetsApiKey: string | undefined,
  sheetName: string | undefined,
}

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

export interface IBaseingestorArgs {
  config?: ConfigType;
  logger?: loggerModule.ILogger;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
}

export class BaseIngestor {
  config: ConfigType = {
    spreadsheetId: undefined,
    googlesheetsApiKey: undefined,
    sheetName: undefined,
  }
  logger: loggerModule.ILogger;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  constructor({ config, logger, prisma }: IBaseingestorArgs) {
    if (config) {
      this.config = config;
    }
    if (!prisma) {
      throw new TypeError('constructor must receive a prisma:PrismaClient');
    }
    this.prisma = prisma;
    this.logger = logger
      ? (logger as loggerModule.ILogger)
      : loggerModule.logger;
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
          subject[key] = normalise(row[key]!);
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

    row.Subject = normalise(row.Subject);
    row.Verb = normalise(row.Verb);
    row.Object = normalise(row.Object);

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
        this.logger.debug(`Created ${msg}`);

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
