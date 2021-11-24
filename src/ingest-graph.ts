import * as fsImport from 'fs';
// import * as readlineImport from 'node:readline';
import { parse } from 'csv-parse';
import { Prisma, PrismaClient } from '@prisma/client';
import * as loggerModule from 'src/logger';
import { normalise, makeActionId } from './erd';

export interface ISubjectVerbObjectComment {
  Subject: string;
  Verb: string;
  Object: string;
  comment?: string;
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

export interface IGraphIngesterArgs {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  filepath: string;
  fs?: any; // ugh
  readline?: any; // ugh
  logger?: loggerModule.ILogger;
}

export class GraphIngester {
  fs = fsImport;
  logger: loggerModule.ILogger;
  filepath: string;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  private _inputTextLine: string = '';

  constructor({ logger, prisma, filepath, fs, readline }: IGraphIngesterArgs) {
    if (fs) {
      this.fs = fs;
    }
    if (!filepath) {
      throw new TypeError('constructor must receive a filepath:string');
    }
    if (!prisma) {
      throw new TypeError('constructor must receive a prisma:PrismaClient');
    }
    this.prisma = prisma;
    this.filepath = filepath;
    this.logger = logger ? logger as loggerModule.ILogger : loggerModule.logger;
  }

  async parseFile(): Promise<void> {
    this.logger.debug('Enter parseFile for ' + this.filepath);

    const input = this.fs.createReadStream(this.filepath)
      .on('error', (error: Error) => {
        console.error(error.message);
      })
      .pipe(parse({
        // expose options?
        columns: true,
        trim: true,
        relax_column_count_less: true,
        skip_empty_lines: true,
      }))
      .on('data', (row) => {
        this._ingestLine(row);
      });
  }

  async _ingestLine(groups: ISubjectVerbObjectComment): Promise<void> {
    this.logger.debug('Enter _ingestLine', groups);

    if (!groups) {
      throw new GrammarError(`inputTextline: "${groups}"`);
    }

    await this._createSubjectObjectVerbAction(groups);
  }

  // subject = existing | new (prisma.createOrSelect)
  async _createSubjectObjectVerbAction(groups: ISubjectVerbObjectComment) {
    this.logger.debug('_createSubjectObjectVerbAction for groups:', groups);

    if (!groups || !groups?.Subject || !groups?.Verb || !groups?.Object) {
      throw new GrammarError(`subjectToFind:${groups?.Subject} verbToFind:${groups?.Verb} objectToFind:${groups?.Object}`);
    }

    groups.Subject = normalise(groups.Subject);
    groups.Verb = normalise(groups.Verb);
    groups.Object = normalise(groups.Object);

    let foundSubject = CachedIds.Entity[groups.Subject]
      ? {
        knownas: groups.Subject,
        id: CachedIds.Entity[groups.Subject]
      }
      :
      await this.prisma.entity.findFirst({
        where: { knownas: groups.Subject },
        select: { id: true },
      });

    this.logger.debug(`Got subject "${JSON.stringify(foundSubject)}" via "${groups.Subject}"`);

    if (foundSubject === null) {
      try {
        foundSubject = await this.prisma.entity.create({
          data: {
            knownas: groups.Subject,
            formalname: groups.Subject,
          },
          select: { id: true }
        });
        CachedIds.Entity[groups.Subject] = foundSubject.id;
      } catch (e) {
        throw new Error(`Failed to create subject entity for "${groups.Subject}" - ${(e as Error).message}`);
      }
    }

    let foundVerb = CachedIds.Entity[groups.Verb]
      ? {
        name: groups.Verb,
        id: CachedIds.Entity[groups.Verb]
      }
      : await this.prisma.verb.findFirst({ where: { name: groups.Verb }, select: { id: true } });

    if (foundVerb === null) {
      try {
        foundVerb = await this.prisma.verb.create({
          data: { name: groups.Verb },
          select: { id: true }
        });
        CachedIds.Verb[groups.Verb] = foundVerb.id;
      }
      catch (e) {
        throw new Error(`Failed to create verb from "${groups.Verb}" - ${(e as Error).message}`);
      }
    }

    let foundObject = CachedIds.Entity[groups.Object] ?
      {
        knwonas: groups.Object,
        id: CachedIds.Entity[groups.Object]
      }
      :
      await this.prisma.entity.findFirst({
        where: { knownas: groups.Object },
        select: { id: true },
      });

    if (foundObject === null) {
      try {
        foundObject = await this.prisma.entity.create({
          data: {
            formalname: groups.Object,
            knownas: groups.Object,
          },
          select: { id: true }
        });
        CachedIds.Entity[groups.Object] = foundObject.id;
      }
      catch (e) {
        throw new Error(`Failed to create object entity for  "${groups.Object}" - ${(e as Error).message}`);
      }
    }

    const actionId = makeActionId(foundSubject.id, foundVerb.id, foundObject.id);

    if (CachedIds.Action[actionId]) {
      this.logger.debug(`Action found in cache - "${actionId}" for: ${groups.Subject} ${groups.Verb} ${groups.Object} `);
    }

    else {
      const actionExists = await this.prisma.action.findFirst({
        where: {
          subjectId: foundSubject.id as number,
          verbId: foundVerb.id as number,
          objectId: foundObject.id as number,
        }
      })

      const msg = `actionId "${actionId}" for "${groups.Subject} ${groups.Verb} ${groups.Object}": ${actionExists}`;

      CachedIds.Action[actionId] = true;

      if (actionExists === null) {
        await this.prisma.action.create({
          data: {
            Subject: { connect: { id: foundSubject.id as number } },
            Verb: { connect: { id: foundVerb.id as number } },
            Object: { connect: { id: foundObject.id as number } },
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

