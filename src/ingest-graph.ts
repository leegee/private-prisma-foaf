import * as fsImport from 'fs';
import * as readlineImport from 'readline';

import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from 'src/logger';

export interface ISubjectVerbObjectComment {
  subject: string;
  verb: string;
  object: string;
  comment?: string;
}

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
}

export class GraphIngester {
  public static RE = RE;

  fs = fsImport;
  readline = readlineImport;
  filepath: string;
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  private _inputTextLine: string = '';

  constructor({ prisma, filepath, fs, readline }: IGraphIngesterArgs) {
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
  }

  async parseFile(): Promise<void> {
    logger.info('Enter parseFile for ' + this.filepath);

    const rl = this.readline.createInterface({
      input: this.fs.createReadStream(this.filepath),
      output: process.stdout,
      terminal: false
    });

    return new Promise((resolve, reject) => {
      rl.on('line', (line: string) => {
        logger.debug('readline on.line');
        this._ingestLine(line);
      });

      rl.on('end', resolve);
      rl.on('error', reject);
    });
  }

  async _ingestLine(inputTextLine: string): Promise<void> {
    logger.debug('Enter _ingestLine', inputTextLine);

    this._inputTextLine = inputTextLine;

    const reRv = RE.entity.exec(inputTextLine);

    if (reRv === null) {
      throw new GrammarError(`Regex failed to run on: ${inputTextLine}`);
    }

    const groups = reRv.groups as ISubjectVerbObjectComment | undefined;

    if (!groups || !groups?.subject || !groups?.verb || !groups?.object) {
      throw new GrammarError(`subjectToFind:${groups?.subject} verbToFind:${groups?.verb} objectToFind:${groups?.object}`);
    }

    await this._createSubjectObjectVerbAction(groups);
  }

  // subject = existing | new (prisma.createOrSelect)
  async _createSubjectObjectVerbAction(groups: ISubjectVerbObjectComment) {
    let subject = await this.prisma.entity.findUnique({
      where: { knownas: groups.subject },
      select: { id: true },
    });
    logger.info(`Got subject "${JSON.stringify(subject)}" via "${groups.subject}"`);

    let verb = await this.prisma.verb.findUnique({
      where: { name: groups.verb },
      select: { id: true },
    });

    let object = await this.prisma.entity.findUnique({
      where: { knownas: groups.object },
      select: { id: true },
    });

    if (subject === null) {
      try {
        subject = await this.prisma.entity.create({
          data: {
            knownas: groups.subject,
            formalname: groups.subject,
          }
        });
      } catch (e) {
        logger.error(JSON.stringify(
          await this.prisma.entity.findUnique({
            where: { knownas: groups.subject }
          }),
          null,
          4)
        );
        logger.error(`Failed to create subject entity for "${groups.subject}" - ` + (e as Error).message);
        throw e;
      }
    }

    if (object === null) {
      object = await this.prisma.entity.create({
        data: {
          formalname: groups.object,
          knownas: groups.object,
        },
        include: { Object: true }
      });
    }

    if (verb === null) {
      verb = await this.prisma.verb.create({
        data: { name: groups.verb }
      });
    }

    if (subject === null || object === null || verb === null) {
      throw new GrammarError(this._inputTextLine);
    }

    const actionExists = await this.prisma.action.findFirst({
      where: {
        subjectId: subject.id,
        verbId: verb.id,
        objectId: object.id,
      }
    });

    if (!!actionExists) {
      await this.prisma.action.create({
        data: {
          Subject: { connect: { id: subject.id } },
          Verb: { connect: { id: verb.id } },
          Object: { connect: { id: object.id } },
        }
      });
      logger.info(`Created: ${groups.subject} ${groups.verb} ${groups.object}`);
    } else {
      logger.info(`Link to: ${groups.subject} ${groups.verb} ${groups.object}`);
    }
  }
}