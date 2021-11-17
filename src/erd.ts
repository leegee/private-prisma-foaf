import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import { PrismaClient, Prisma } from '@prisma/client';

// Rendering based on node_modules\prisma-erd-generator\src\generate.ts
export async function erd(
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  knownas: string,
) {
  const actions = await _getActions(prisma, knownas);
  _save(actions);
  return actions;
}

async function _getActions(
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  knownas: string,
) {
  const person = await prisma.person.findFirst({
    where: { knownas },
    select: { id: true },
  });

  if (!person) {
    throw new Error(`No such person knownas "${knownas}"`);
  }

  const actions = await prisma.action.findMany({
    where: { subjectId: person.id },
    select: {
      Subject: true,
      Object: true,
      Verb: true,
    },
  });

  if (actions.length === 0) {
    throw new Error(`No actions for ${knownas}`);
  }

  return actions;
}

function _save(actions: any[]) {
  let mermaid = 'graph TD\n';

  actions.forEach((action) => {
    mermaid +=
      'Person' +
      (action as any).Object.id +
      '[' +
      (action as any).Subject.knownas +
      ']' +
      '-->|' +
      (action as any).Verb.name +
      '|' +
      'Person' +
      (action as any).Subject.id +
      '[' +
      (action as any).Object.knownas +
      ']';
  });

  const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'prisma-erd-');
  const output = './temp.svg';
  const theme = 'forest';

  const tempMermaidFile = path.resolve(path.join(tmpDir, 'prisma.mmd'));
  fs.writeFileSync(tempMermaidFile, mermaid);

  const tempConfigFile = path.resolve(path.join(tmpDir, 'config.json'));
  fs.writeFileSync(tempConfigFile, JSON.stringify({ deterministicIds: true }));

  const mermaidCliNodePath = path.resolve(
    path.join('node_modules', '.bin', 'mmdc'),
  );

  child_process.execSync(
    `${mermaidCliNodePath} -i ${tempMermaidFile} -o ${output} -t ${theme} -c ${tempConfigFile}`,
    {
      stdio: 'inherit',
    },
  );

  return actions;
}
