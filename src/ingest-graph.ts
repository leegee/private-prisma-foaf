import * as fsImport from 'fs';
import * as readlineImport from 'node:readline';

import { Prisma, PrismaClient } from '@prisma/client';
import * as loggerModule from 'src/logger';
import { normalise, makeActionId } from './erd';

export interface ISubjectVerbObjectComment {
  subject: string;
  verb: string;
  object: string;
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

export interface IRE {
  [key: string]: RegExp
}

const RE = {
  verb: new RegExp(`^
    \\s*
    ( ?<name> [^\(]+ ) \\s*
    \\s+
    \(
      \\s*
      ( ?<start> \d{4} –? \d{2} –? \d{2] )
      \\s*-\\s*
      ( ?<end>   \d{4} –? \d{2} –? \d{2] )
      \\s*
    \)
  $`),

  entity: new RegExp(
    [
      '^',
      '\\s*',                             // May be whitespace at the start of the line
      '\\[',                              // Surrounded by square brackets,
      '(?<subject>[^\\]]+)',              //   Collect $1(subject)
      '\\]',                              // End square bracket surrounding subject
      '\\s*\\-+\\>\\s*',                      //  --> arrow, maybe surrounded by whitespace
      '\\|',                           // Surrounded by bars
      '(?<verb>[^\\|]+)',            //   Collect $2 (verb)
      '\\|',                         // nd bars surrounding verb
      '\\s*',                        // May be whitespace
      '\\[',                         // Surrounded by square brackets
      '(?<object>[^\\]]+)',          //   Collect $3 (object)
      '\\]',                         // End square brackets surrounding object
      '\\s*',                        // May be whitespace
      '(#\\s*(?<comment>.+))?',          // May be $4 Free-text comment
      '\\s*$',                       // May be whitespace at the end of the line
    ].join('')
  ),
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
  public static RE = RE;

  fs = fsImport;
  logger: loggerModule.ILogger;
  readline = readlineImport;
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
    if (readline) {
      this.readline = readline;
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

    const input = this.fs.createReadStream(this.filepath);

    const rl = this.readline.createInterface({
      input,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      this._ingestLine(line);
    }
  }

  async _ingestLine(inputTextLine: string): Promise<void> {
    this.logger.debug('Enter _ingestLine' + inputTextLine);

    this._inputTextLine = inputTextLine;

    const reRv = RE.entity.exec(inputTextLine);

    if (reRv === null) {
      throw new GrammarError(`Regex failed to run on: ${inputTextLine}`);
    }

    const groups = reRv.groups as ISubjectVerbObjectComment | undefined;

    if (!groups) {
      throw new GrammarError(`inputTextline: "${inputTextLine}"`);
    }

    await this._createSubjectObjectVerbAction(groups);
  }

  // subject = existing | new (prisma.createOrSelect)
  async _createSubjectObjectVerbAction(groups: ISubjectVerbObjectComment) {
    this.logger.debug('_createSubjectObjectVerbAction for groups: ' + JSON.stringify(groups, null, 4));

    if (!groups || !groups?.subject || !groups?.verb || !groups?.object) {
      throw new GrammarError(`subjectToFind:${groups?.subject} verbToFind:${groups?.verb} objectToFind:${groups?.object}`);
    }

    groups.subject = normalise(groups.subject);
    groups.verb = normalise(groups.verb);
    groups.object = normalise(groups.object);

    let foundSubject = CachedIds.Entity[groups.subject]
      ? {
        knownas: groups.subject,
        id: CachedIds.Entity[groups.subject]
      }
      :
      await this.prisma.entity.findFirst({
        where: { knownas: groups.subject },
        select: { id: true },
      });

    this.logger.debug(`Got subject "${JSON.stringify(foundSubject)}" via "${groups.subject}"`);

    if (foundSubject === null) {
      try {
        foundSubject = await this.prisma.entity.create({
          data: {
            knownas: groups.subject,
            formalname: groups.subject,
          },
          select: { id: true }
        });
        CachedIds.Entity[groups.subject] = foundSubject.id;
      } catch (e) {
        throw new Error(`Failed to create subject entity for "${groups.subject}" - ${(e as Error).message}`);
      }
    }

    let foundVerb = CachedIds.Entity[groups.verb]
      ? {
        name: groups.verb,
        id: CachedIds.Entity[groups.verb]
      }
      : await this.prisma.verb.findFirst({ where: { name: groups.verb }, select: { id: true } });

    if (foundVerb === null) {
      try {
        foundVerb = await this.prisma.verb.create({
          data: { name: groups.verb },
          select: { id: true }
        });
        CachedIds.Verb[groups.verb] = foundVerb.id;
      }
      catch (e) {
        throw new Error(`
### Failed to create verb from "${groups.verb}"
### ${(e as Error).message}
### Then found: ${JSON.stringify(
          await this.prisma.verb.findFirst({ where: { name: groups.verb }, select: { id: true } }),
          null, 4
        )}\n`);
      }

    }

    let foundObject = CachedIds.Entity[groups.object] ?
      {
        knwonas: groups.object,
        id: CachedIds.Entity[groups.object]
      }
      :
      await this.prisma.entity.findFirst({
        where: { knownas: groups.object },
        select: { id: true },
      });

    if (foundObject === null) {
      try {
        foundObject = await this.prisma.entity.create({
          data: {
            formalname: groups.object,
            knownas: groups.object,
          },
          select: { id: true }
        });
        CachedIds.Entity[groups.object] = foundObject.id;
      }
      catch (e) {
        throw new Error(`Failed to create object entity for  "${groups.object}" - ${(e as Error).message}`);
      }
    }

    const actionId = makeActionId(foundSubject.id, foundVerb.id, foundObject.id);

    if (CachedIds.Action[actionId]) {
      this.logger.debug(`Action found in cache - "${actionId}" for: ${groups.subject} ${groups.verb} ${groups.object} `);
    }

    else {
      const actionExists = await this.prisma.action.findFirst({
        where: {
          subjectId: foundSubject.id as number,
          verbId: foundVerb.id as number,
          objectId: foundObject.id as number,
        }
      })

      const msg = `actionId "${actionId}" for "${groups.subject} ${groups.verb} ${groups.object}": ${JSON.stringify(actionExists, null, 4)}`;

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

