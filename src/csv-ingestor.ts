import * as fsImport from 'fs';
// import * as readlineImport from 'node:readline';
import { parse } from 'csv-parse';
import { Prisma, PrismaClient } from '@prisma/client';
import * as loggerModule from 'src/logger';
import { normalise, makeActionId } from './erd';

export interface IEntityFileRow {
  Subject: string;
  Verb: string;
  Object: string;
  Comment?: string;
  start?: string;
  end?: string;
}

export interface Iknownas2id {
  [key: string]: number,
}

export interface Iknownas2boolean {
  [key: string]: boolean,
}

export interface ICache {
  Entity: Iknownas2id,
  Verb: Iknownas2id,
  Action: Iknownas2boolean,
}

const CachedIds: ICache = {
  Entity: {},
  Verb: {},
  Action: {},
};

export class GrammarError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, GrammarError.prototype);
  }
}

export interface ICsvIngesterArgs {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  fs?: any; // ugh
  logger?: loggerModule.ILogger;
}

export class CsvIngester {
  fs = fsImport;
  logger: loggerModule.ILogger;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  private _inputTextLine: string = '';

  constructor({ logger, prisma, fs }: ICsvIngesterArgs) {
    if (fs) {
      this.fs = fs;
    }
    if (!prisma) {
      throw new TypeError('constructor must receive a prisma:PrismaClient');
    }
    this.prisma = prisma;
    this.logger = logger ? logger as loggerModule.ILogger : loggerModule.logger;
  }

  async parseRelationsFile(filepath: string): Promise<void> {
    if (!filepath) {
      throw new TypeError('constructor must receive a filepath:string');
    }
    this.logger.debug('Enter loadEntities for ' + filepath);

    this.fs.createReadStream(filepath)
      .on('error', (error: Error) => this.logger.error(error))
      .pipe(parse({
        columns: true,
        trim: true,
        relax_column_count_less: true,
        skip_empty_lines: true,
      }))
      .on('data', async (row) => {
        if (!row) {
          throw new GrammarError(`inputTextline: "${row}"`);
        }
        await this._createSubjectObjectVerbAction(row);
      });
  }

  async _createSubjectObjectVerbAction(row: IEntityFileRow) {
    this.logger.debug('_createSubjectObjectVerbAction for groups:', row);

    if (!row || !row.Subject || !row.Verb || !row.Object) {
      throw new GrammarError(JSON.stringify(row, null, 2));
    }

    row.Subject = normalise(row.Subject);
    row.Verb = normalise(row.Verb);
    row.Object = normalise(row.Object);

    let foundSubject = CachedIds.Entity[row.Subject]
      ? {
        knownas: row.Subject,
        id: CachedIds.Entity[row.Subject]
      }
      :
      await this.prisma.entity.findFirst({
        where: { knownas: row.Subject },
        select: { id: true },
      });

    this.logger.debug(`Got subject "${JSON.stringify(foundSubject)}" via "${row.Subject}"`);

    if (foundSubject === null) {
      try {
        foundSubject = await this.prisma.entity.create({
          data: {
            knownas: row.Subject,
            formalname: row.Subject,
          },
          select: { id: true }
        });
        CachedIds.Entity[row.Subject] = foundSubject.id;
      }
      catch (e) {
        throw new Error(`Failed to create subject entity for "${row.Subject}" - ${(e as Error).message}`);
      }
    }

    let foundVerb = CachedIds.Entity[row.Verb]
      ? {
        name: row.Verb,
        id: CachedIds.Entity[row.Verb]
      }
      : await this.prisma.verb.findFirst({ where: { name: row.Verb }, select: { id: true } });

    if (foundVerb === null) {
      try {
        foundVerb = await this.prisma.verb.create({
          data: { name: row.Verb },
          select: { id: true }
        });
        CachedIds.Verb[row.Verb] = foundVerb.id;
      }
      catch (e) {
        throw new Error(`Failed to create verb from "${row.Verb}" - ${(e as Error).message}`);
      }
    }

    let foundObject = CachedIds.Entity[row.Object] ?
      {
        knwonas: row.Object,
        id: CachedIds.Entity[row.Object]
      }
      :
      await this.prisma.entity.findFirst({
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
          select: { id: true }
        });
        CachedIds.Entity[row.Object] = foundObject.id;
      }
      catch (e) {
        throw new Error(`Failed to create object entity for  "${row.Object}" - ${(e as Error).message}`);
      }
    }

    const actionId = makeActionId(foundSubject.id, foundVerb.id, foundObject.id);

    if (CachedIds.Action[actionId]) {
      this.logger.debug(`Action found in cache - "${actionId}" for: ${row.Subject} ${row.Verb} ${row.Object} `);
    }

    else {
      const start = row.start ? new Date(row.start) : null;
      const end = row.end ? new Date(row.end) : null;

      const actionExists = await this.prisma.action.findFirst({
        where: {
          subjectId: foundSubject.id as number,
          verbId: foundVerb.id as number,
          objectId: foundObject.id as number,
          start,
          end,
        }
      })

      const msg = `actionId "${actionId}" for "${row.Subject} ${row.Verb} ${row.Object}": ${actionExists}`;

      CachedIds.Action[actionId] = true;

      if (actionExists === null) {
        await this.prisma.action.create({
          data: {
            Subject: { connect: { id: foundSubject.id as number } },
            Verb: { connect: { id: foundVerb.id as number } },
            Object: { connect: { id: foundObject.id as number } },
            start,
            end,
          }
        });
        this.logger.debug(`Created ${msg}`);
      }

      else {
        this.logger.debug(`Linked to ${msg}`);
      }
    }

  }
}

