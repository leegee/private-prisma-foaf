import * as fsImport from 'fs';
import * as readlineImport from 'readline';

import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from 'src/logger';

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
    super(`No such entity knownas "${message}".`);
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

    const reRv = RE.entity.exec(inputTextLine);

    logger.debug('_ingestLine reRv');
    logger.dir(reRv, { depth: null });

    const groups = reRv?.groups;

    const subjectToFind = {
      knownas: groups?.subject,
      formalname: groups?.subject,
    };

    const verbToFind = { name: groups?.verb };

    const objectToFind = {
      formalname: groups?.object,
      knownas: groups?.object,
    };

    if (!!subjectToFind || !!verbToFind || !!objectToFind) {
      throw new GrammarError(`subjectToFind:${subjectToFind} verbToFind:${verbToFind} objectToFind:${objectToFind}`);
    }

    let subject = await this.prisma.entity.findFirst({
      where: { OR: [subjectToFind] },
      select: { id: true },
    });

    let verb = await this.prisma.verb.findFirst({
      where: { name: verbToFind },
      select: { id: true },
    });

    let object = await this.prisma.entity.findFirst({
      where: { OR: [objectToFind] },
      select: { id: true },
    });

    if (subject === null) {
      subject = await this.prisma.entity.create({
        data: subjectToFind,
        include: { Subject: true }
      });
    }

    if (object === null) {
      object = await this.prisma.entity.create({
        data: objectToFind,
        include: { Object: true }
      });
    }

    if (verb === null) {
      verb = await this.prisma.verb.create({
        data: verbToFind
      });
    }

    if (subject === null || object === null || verb === null) {
      throw new GrammarError(inputTextLine);
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
      logger.info(`Created: ${subjectToFind} ${verbToFind} ${objectToFind}`);
    } else {
      logger.info(`Link to: ${subjectToFind} ${verbToFind} ${objectToFind}`);
    }
  }
}