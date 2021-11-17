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
  savepath: string,
): Promise<void> {
  const actionsSubjectObject = await _getActionsGraph(prisma, knownas);
  const actionsObjectSubject = await _getActionsGraph(prisma, knownas, true);
  _save([actionsSubjectObject, actionsObjectSubject], savepath);
}


export async function _getActions(
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  knownas: string,
  invertedRelationship = false
) {
  const person = await prisma.person.findFirst({
    where: { knownas },
    select: { id: true },
  });

  if (!person) {
    throw new Error(`No such person knownas "${knownas}"`);
  }

  const where = invertedRelationship ? { objectId: person.id } : { subjectId: person.id };

  const actions = await prisma.action.findMany({
    where,
    select: {
      Subject: true,
      Object: true,
      Verb: true,
    },
  });

  return actions;
}


export async function _getActionsGraph(
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  knownas: string,
  invertedRelationship = false,
) {
  const actions = await _getActions(prisma, knownas, invertedRelationship);

  if (actions.length === 0) {
    throw new Error(`No actions for ${knownas}`);
  }

  let mermaid = '';

  actions.forEach((action) => {
    if (invertedRelationship) {
      mermaid +=
        'Person' +
        (action as any).Subject.id +
        '[' +
        (action as any).Subject.knownas +
        ']-->|' +
        (action as any).Verb.name +
        '|Person' +
        (action as any).Object.id +
        '[' +
        (action as any).Object.knownas +
        ']' +
        '\n';
    } else {
      mermaid +=
        'Person' +
        (action as any).Subject.id +
        '[' +
        (action as any).Subject.knownas +
        ']-->|' +
        (action as any).Verb.name +
        '|Person' +
        (action as any).Object.id +
        '[' +
        (action as any).Object.knownas +
        ']' +
        '\n';
    }
  });

  return mermaid;
}

export function _save(graphedActions: string[], savepath: string): void {
  let mermaid = 'graph TD\n';

  mermaid += graphedActions.join("\n");

  const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'prisma-erd-');
  const theme = 'forest';

  const tempMermaidFile = path.resolve(path.join(tmpDir, 'prisma.mmd'));
  fs.writeFileSync(tempMermaidFile, mermaid);

  const tempConfigFile = path.resolve(path.join(tmpDir, 'config.json'));
  fs.writeFileSync(tempConfigFile, JSON.stringify({ deterministicIds: true }));

  const mermaidCliNodePath = path.resolve(
    path.join('node_modules', '.bin', 'mmdc'),
  );

  child_process.execSync(
    `${mermaidCliNodePath} -i ${tempMermaidFile} -o ${savepath} -t ${theme} -c ${tempConfigFile}`,
    {
      stdio: 'inherit',
    },
  );
}
