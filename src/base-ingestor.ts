import * as fsImport from 'fs';
import { parse } from 'csv-parse';
import { Prisma, PrismaClient } from '@prisma/client';
import * as loggerModule from 'src/logger';
import { normalise, makePredicateId } from './erd';
import fetch from 'node-fetch';

// prisma.$use(async (params, next) => {
//   const before = Date.now()
//   const result = await next(params)
//   const after = Date.now()
//   console.log(
//     `Query ${params.model}.${params.action} took ${after - before}ms`,
//   )
//   return result
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
  fs?: any; // ugh
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
  fs = fsImport;
  logger: loggerModule.ILogger;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  constructor({ config, logger, prisma, fs }: IBaseingestorArgs) {
    if (fs) {
      this.fs = fs;
    }
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

    await this.prisma.entity.upsert({
      create: subject as IEntityUpsertArgs,
      update: subject as IEntityUpsertArgs,
      where: {
        knownas: row.knownas,
      }
    });
  }

  async _createSubjectObjectVerbPredicate(row: IPredicateUpsertArgs) {
    this.logger.debug('_createSubjectObjectVerbPredicate for row:', row);

    if (!row || !row.Subject || !row.Verb || !row.Object) {
      throw new GrammarError(JSON.stringify(row, null, 2));
    }

    row.Subject = normalise(row.Subject);
    row.Verb = normalise(row.Verb);
    row.Object = normalise(row.Object);

    // try upsert without changing anything?

    let foundSubject = CachedIds.Entity[row.Subject]
      ? {
        knownas: row.Subject,
        id: CachedIds.Entity[row.Subject],
      }
      : await this.prisma.entity.findFirst({
        where: { knownas: row.Subject },
        select: { id: true },
      });

    this.logger.debug(
      `Got subject "${JSON.stringify(foundSubject)}" via "${row.Subject}"`,
    );

    if (foundSubject === null) {
      try {
        foundSubject = await this.prisma.entity.create({
          data: {
            knownas: row.Subject,
            formalname: row.Subject,
          },
          select: { id: true },
        });
        CachedIds.Entity[row.Subject] = foundSubject.id;
      } catch (e) {
        throw new Error(
          `Failed to create subject entity for "${row.Subject}" - ${(e as Error).message
          }`,
        );
      }
    }

    let foundVerb = CachedIds.Entity[row.Verb]
      ? {
        name: row.Verb,
        id: CachedIds.Entity[row.Verb],
      }
      : await this.prisma.verb.findFirst({
        where: { name: row.Verb },
        select: { id: true },
      });

    if (foundVerb === null) {
      try {
        foundVerb = await this.prisma.verb.create({
          data: { name: row.Verb },
          select: { id: true },
        });
        CachedIds.Verb[row.Verb] = foundVerb.id;
      } catch (e) {
        throw new Error(
          `Failed to create verb from "${row.Verb}" - ${(e as Error).message}`,
        );
      }
    }

    let foundObject = CachedIds.Entity[row.Object]
      ? {
        knwonas: row.Object,
        id: CachedIds.Entity[row.Object],
      }
      : await this.prisma.entity.findFirst({
        where: { knownas: row.Object },
        select: { id: true },
      });

    if (foundObject === null) {
      try {
        foundObject = await this.prisma.entity.create({
          data: {
            formalname: row.Object,
            knownas: row.Object,
          },
          select: { id: true },
        });
        CachedIds.Entity[row.Object] = foundObject.id;
      } catch (e) {
        throw new Error(
          `Failed to create object entity for  "${row.Object}" - ${(e as Error).message
          }`,
        );
      }
    }

    const predicateId = makePredicateId(
      foundSubject.id,
      foundVerb.id,
      foundObject.id,
    );

    if (CachedIds.Predicate[predicateId]) {
      this.logger.debug(
        `Predicate found in cache - "${predicateId}" for: ${row.Subject} ${row.Verb} ${row.Object} `,
      );
    }

    else {
      const start = row.start ? new Date(row.start) : null;
      const end = row.end ? new Date(row.end) : null;

      const predicateExists = await this.prisma.predicate.findFirst({
        where: {
          subjectId: foundSubject.id as number,
          verbId: foundVerb.id as number,
          objectId: foundObject.id as number,
          start,
          end,
        },
      });

      const msg = `predicateId "${predicateId}" for "${row.Subject} ${row.Verb} ${row.Object}": ${predicateExists}`;

      CachedIds.Predicate[predicateId] = true;

      if (predicateExists === null) {
        try {
          await this.prisma.predicate.create({
            data: {
              Subject: { connect: { id: foundSubject.id as number } },
              Verb: { connect: { id: foundVerb.id as number } },
              Object: { connect: { id: foundObject.id as number } },
              start,
              end,
            },
          });
          this.logger.debug(`Created ${msg}`);
        } catch (e) {
          this.logger.error(`Failed to create ${msg}`);
          this.logger.error(e);
        }
      } else {
        this.logger.debug(`Linked to ${msg}`);
      }
    }
  }

}
