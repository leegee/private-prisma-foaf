// Rendering based on node_modules\prisma-erd-generator\src\generate.ts

import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import { PrismaClient, Prisma, Person } from '@prisma/client';

export interface IErdArgs {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >,
  knownas: string,
  savepath: string,
  invertedRelationship: boolean
}

export class Erd {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
  knownas: string;
  savepath: string;
  invertedRelationship: boolean;
  personId: number | undefined;

  constructor({
    prisma,
    knownas,
    savepath,
    invertedRelationship = false,
  }: IErdArgs
  ) {
    this.prisma = prisma;
    this.knownas = knownas;
    this.savepath = savepath;
    this.invertedRelationship = invertedRelationship;
  }

  async createFile() {
    const graph = await this._create();
    this._save(graph);
  }

  async _create() {
    const actions = [];

    const actionsSubjectObject = await this._getActionsGraph();

    actions.push(actionsSubjectObject);

    if (this.invertedRelationship) {
      const actionsObjectSubject = await this._getActionsGraph();
      actions.push(actionsObjectSubject);
    }

    return this._composeGraph(actions);
  }

  async _getActionsGraph() {
    const actions = await this._getActions();

    let mermaid = '';

    actions.forEach((action) => {
      if (this.invertedRelationship) {
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


  async _getActions() {
    if (!!this.personId) {
      const person = await this.prisma.person.findFirst({
        where: { knownas: this.knownas },
        select: { id: true },
      });
      if (!person) {
        throw new Error(`No such person knownas "${this.knownas}"`);
      }

      this.personId = person.id;
    }

    const where = this.invertedRelationship ? { objectId: this.personId } : { subjectId: this.personId };

    const actions = await this.prisma.action.findMany({
      where,
      select: {
        Subject: true,
        Object: true,
        Verb: true,
      },
    });

    return actions;
  }

  _composeGraph(graphedActions: string[]): string {
    return 'graph TD\n' + graphedActions.join("\n");
  }

  _save(graph: string): void {
    const tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'person-erd-');
    const theme = 'forest';

    const tempMermaidFile = path.resolve(path.join(tmpDir, 'person-erd.mmd'));
    fs.writeFileSync(tempMermaidFile, graph);

    const tempConfigFile = path.resolve(path.join(tmpDir, 'config.json'));
    fs.writeFileSync(tempConfigFile, JSON.stringify({ deterministicIds: true }));

    const mermaidCliNodePath = path.resolve(
      path.join('node_modules', '.bin', 'mmdc'),
    );

    child_process.execSync(
      `${mermaidCliNodePath} -i ${tempMermaidFile} -o ${this.savepath} -t ${theme} -c ${tempConfigFile}`,
      {
        stdio: 'inherit',
      },
    );

    fs.unlinkSync(tempMermaidFile);
    fs.unlinkSync(tempConfigFile);

    // todo: throw on write error
  }
}
