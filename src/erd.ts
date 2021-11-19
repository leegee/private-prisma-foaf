// Rendering based on node_modules\prisma-erd-generator\src\generate.ts

import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import { PrismaClient, Prisma, Person } from '@prisma/client';

export class PersonNotFoundError extends Error {
  constructor(message: string) {
    super(`No such person knownas "${message}".`);
    Object.setPrototypeOf(this, PersonNotFoundError.prototype);
  }
}

export interface IErdArgs {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  knownas: string;
  savepath?: string;
}

export class Erd {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  knownas: string;
  savepath?: string;
  personId: number | undefined;
  tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'person-erd-');
  theme = 'forest';

  constructor({ prisma, knownas, savepath }: IErdArgs) {
    this.prisma = prisma;
    this.knownas = knownas;
    if (savepath) {
      this.savepath = savepath;
    }
  }

  async createString(): Promise<string> {
    let remove = false;
    if (!this.savepath) {
      remove = true;
      this.savepath = 'temp.svg';
    }

    await this.createFile();

    const svg = fs.readFileSync(this.savepath, 'utf8');

    if (remove) {
      fs.unlinkSync(this.savepath);
      delete this.savepath;
    }

    return svg;
  }

  async createFile() {
    const graph = await this._create();
    this._save(graph);
  }

  async _create() {
    const actions = await this._getActionsGraph();
    return this._composeGraph(actions);
  }

  async _getActionsGraph() {
    const actions = await this._getActions();

    let mermaid = '';

    actions.forEach((action) => {
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
    });

    return mermaid;
  }

  async _getActions() {
    if (!this.personId) {
      const person = await this.prisma.person.findFirst({
        where: { knownas: this.knownas },
        select: { id: true },
      });

      if (person === null) {
        throw new PersonNotFoundError(this.knownas);
      }

      this.personId = person?.id;
    }

    const actions = await this.prisma.action.findMany({
      where: {
        OR: [
          { objectId: this.personId },
          { subjectId: this.personId },
        ],
      },
      select: {
        Subject: true,
        Object: true,
        Verb: true,
      },
    });

    return actions;
  }

  _composeGraph(graphedActions: string): string {
    return 'graph TD\n' + graphedActions + '\n';
  }

  _save(graph: string): void {
    if (!this.savepath) {
      throw new Error('savepath was not supplied during construction');
    }

    const tempMermaidFile = path.resolve(
      path.join(this.tmpDir, 'person-erd.mmd'),
    );
    fs.writeFileSync(tempMermaidFile, graph);

    const tempConfigFile = path.resolve(path.join(this.tmpDir, 'config.json'));
    fs.writeFileSync(
      tempConfigFile,
      JSON.stringify({ deterministicIds: true }),
    );

    const mermaidCliNodePath = path.resolve(
      path.join('node_modules', '.bin', 'mmdc'),
    );

    child_process.execSync(
      `${mermaidCliNodePath} -i ${tempMermaidFile} -o ${this.savepath} -t ${this.theme} -c ${tempConfigFile}`,
      { stdio: 'inherit' },
    );

    fs.unlinkSync(tempMermaidFile);
    fs.unlinkSync(tempConfigFile);

    // todo: nicer errors
  }
}
