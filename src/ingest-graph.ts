import * as fs from 'fs';
import * as readline from 'readline';

import xre from 'xre';
import XRegExp from 'xregexp';

import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from 'src/logger';

xre.configure({ XRegExp });

export interface IRE {
  [key: string]: RegExp
}

export const RE = {
  verb: XRegExp(`/^ \w* ([^\(]+) \w+ \( (\d{4}–\d{2}–\d{2]) \w*-\w* (\d{4}–\d{2}–\d{2]) \w* ) $/`),
  entity: XRegExp(`/^
    \w*                     # May be whitespace at the start of the line
    \[                      # Surrounded by square brackets,
      (?<subject> [^\]]+ )  #   Collect $1 (subject)
    \]                      # End square bracket surrounding subject
    \w* --\> \w*            # --> arrow, maybe surrounded by whitespace
    \|                      # Surrounded by bars
      (?<verb> [^\|]+ )     #   Collect $2 (verb)
    \|                      # nd bars surrounding verb
    \w*                     # May be whitespace
    \[                      # Surrounded by square brackets
      (?<object> [^\]]+ )   #   Collect $3 (object)
    \]                      # End square brackets surrounding object
    \w*                     # May be whitespace
    # (?<comment> .+ )?     # May be $4 Free-text comment
    \w*                     # May be whitespace at the end of the line
  $/`),
};
export class GrammarError extends Error {
  constructor(message: string) {
    super(`No such entity knownas "${message}".`);
    Object.setPrototypeOf(this, GrammarError.prototype);
  }
}

export async function parseFile(
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  filepath: string,
): Promise<void> {

  const rl = readline.createInterface({
    input: fs.createReadStream(filepath),
    output: process.stdout,
    terminal: false
  });

  return new Promise((resolve, reject) => {
    rl.on('line', (line: string) => {
      _ingestLine(prisma, line);
    });

    rl.on('end', resolve);
    rl.on('error', reject);
  });
}

async function _ingestLine(prisma: PrismaClient, inputTextLine: string): Promise<void> {
  console.log(inputTextLine);

  const groups = XRegExp.exec(inputTextLine, RE.entity)?.groups;
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

  let subject = await prisma.entity.findFirst({
    where: { OR: [subjectToFind] },
    select: { id: true },
  });

  let verb = await prisma.verb.findFirst({
    where: { name: verbToFind },
    select: { id: true },
  });

  let object = await prisma.entity.findFirst({
    where: { OR: [objectToFind] },
    select: { id: true },
  });

  if (subject === null) {
    subject = await prisma.entity.create({
      data: subjectToFind,
      include: { Subject: true }
    });
  }

  if (object === null) {
    object = await prisma.entity.create({
      data: objectToFind,
      include: { Object: true }
    });
  }

  if (verb === null) {
    verb = await prisma.verb.create({
      data: verbToFind
    });
  }

  if (subject === null || object === null || verb === null) {
    throw new GrammarError(inputTextLine);
  }

  const actionExists = await prisma.action.findFirst({
    where: {
      subjectId: subject.id,
      verbId: verb.id,
      objectId: object.id,
    }
  });

  if (!!actionExists) {
    await prisma.action.create({
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
