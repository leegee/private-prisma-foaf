import * as fs from 'fs';
import * as readline from 'readline';

import xre from 'xre';
import XRegExp from 'xregexp';

xre.configure({ XRegExp });

import { PrismaClient } from '.prisma/client';

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

async function parseFile(prisma: PrismaClient, filepath: string): Promise<void> {
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

interface IMatch {
  subject: string,
  verb: string,
  object: string
}

async function _ingestLine(prisma: PrismaClient, inputTextLine: string): Promise<void> {
  console.log(inputTextLine);

  const parsed = XRegExp.match(inputTextLine, RE.entity).matched;
  const subjectToFind = parsed.subject;
  const verbToFind = parsed.verb;
  const objectToFind = parsed.object;
}

if (!subjectToFind || !verbToFind || !objectToFind) {
  throw new GrammarError(`subjectToFind:${subjectToFind} verbToFind:${verbToFind} objectToFind:${objectToFind}`);
}

let subject = await prisma.entity.findFirst({
  where: {
    OR: [
      { knownas: subjectToFind },
      { formalname: subjectToFind },
    ],
  },
  select: { id: true },
});

let object = await prisma.entity.findFirst({
  where: {
    OR: [
      { knownas: objectToFind },
      { formalname: subjectToFind },
    ],
  },
  select: { id: true },
});

let verb = await prisma.verb.findFirst({
  where: { name: verbToFind },
  select: { id: true },
});

if (subject === null) {
  subject = await prisma.entity.create({
    data: {
      knownas: subjectToFind,
      formalname: subjectToFind,
    },
    include: { Subject: true }
  });
}

if (object === null) {
  object = await prisma.entity.create({
    data: {
      knownas: objectToFind,
      formalname: objectToFind,
    },
    include: { Object: true }
  });
}

if (verb === null) {
  verb = await prisma.verb.create({
    data: { name: verbToFind }
  });
}

if (subject === null || object === null || verb === null) {
  throw new GrammarError(inputTextLine);
}

await prisma.action.create({
  data: {
    Subject: { connect: { id: subject.id } },
    Verb: { connect: { id: verb.id } },
    Object: { connect: { id: object.id } },
  }
});
}
