// Rendering based on node_modules\prisma-erd-generator\src\generate.ts

import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import { PrismaClient, Prisma, Entity, Verb } from '@prisma/client';

export type SubjectVerbObject = {
  Subject: Entity,
  Verb: Verb,
  Object: Entity,
}

export class EntityNotFoundError extends Error {
  constructor(message: string) {
    super(`No such entity knownas "${message}".`);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}

export interface IErdArgs {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  knownas?: string;
  savepath?: string;
}

export class Erd {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  actions: SubjectVerbObject[] = [];
  knownas: string | undefined = undefined;
  savepath?: string;
  entityId: number | undefined;
  tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'entity-erd-');
  theme = 'forest';

  constructor({ prisma, knownas, savepath }: IErdArgs) {
    this.prisma = prisma;
    if (!!knownas) {
      this.knownas = knownas;
    }
    if (!!savepath) {
      this.savepath = savepath;
    }
  }

  async createStringForOne(): Promise<string> {
    let remove = false;
    if (!this.savepath) {
      remove = true;
      this.savepath = 'temp.svg';
    }

    await this.createFileForOne();

    const svg = fs.readFileSync(this.savepath, 'utf8');

    if (remove) {
      fs.unlinkSync(this.savepath);
      delete this.savepath;
    }

    return svg;
  }

  async createFileForOne() {
    const graph = await this.create();
    this._save(graph);
  }

  async create() {
    if (this.knownas !== undefined) {
      await this._getActionsForOne();
    } else {
      await this._graphActionsForAll();
    }
    const graphedActions = await this._graphActions();
    return this._composeGraph(graphedActions);
  }

  async _graphActions(): Promise<string> {
    let mermaid = '';

    this.actions.forEach((action) => {
      if (action.Subject.id && action.Verb.id && action.Object.id) {
        mermaid +=
          'Entity' + action.Subject.id +
          '[' + action.Subject.knownas + ']-->' +
          '|' + action.Verb.name + '|' +
          'Entity' + action.Object.id +
          '[' + action.Object.knownas + ']' +
          '\n';
      }
    });

    return mermaid;
  }

  async _graphActionsForAll() {
    const entities = await this.prisma.entity.findMany({
      select: { id: true }
    });

    entities.forEach(async (entity) => {
      const actions: SubjectVerbObject[] = await this.prisma.action.findMany({
        where: {
          OR: [
            { objectId: entity.id },
            { subjectId: entity.id },
          ],
        },
        select: {
          Subject: true,
          Object: true,
          Verb: true,
        },
      });

      this.actions.push(...actions);
    });

  }

  async _getActionsForOne() {
    if (this.knownas === undefined) {
      throw new TypeError('._getActionsForOne called without .knownas');
    }

    if (!this.entityId) {
      const entity = await this.prisma.entity.findFirst({
        where: { knownas: this.knownas },
        select: { id: true },
      });

      if (entity === null) {
        throw new EntityNotFoundError(this.knownas);
      }

      this.entityId = entity?.id;
    }

    const actions: SubjectVerbObject[] = await this.prisma.action.findMany({
      where: {
        OR: [
          { objectId: this.entityId },
          { subjectId: this.entityId },
        ],
      },
      select: {
        Subject: true,
        Object: true,
        Verb: true,
      },
    });


    this.actions.push(...actions);
  }

  _composeGraph(graphedActions: string): string {
    return 'graph TD\n' + graphedActions + '\n';
  }

  _save(graph: string): void {
    if (!this.savepath) {
      throw new Error('savepath was not supplied during construction');
    }

    const tempMermaidFile = path.resolve(
      path.join(this.tmpDir, 'entity-erd.mmd'),
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
