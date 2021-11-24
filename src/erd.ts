// Rendering based on node_modules\prisma-erd-generator\src\generate.ts

import * as path from 'path';
import * as child_process from 'child_process';
import fs, { unlinkSync } from 'fs';
import os from 'os';
import { PrismaClient, Prisma, Entity, Verb } from '@prisma/client';
import * as loggerModule from './logger';

export function normalise(subject: string): string {
  return subject.toLowerCase().replace(/[^\w\s'-]+/, '').replace(/\s+/gs, ' ').trim();
}

export function makeActionId(subjectId: number, verbId: number, objectId: number): string {
  return [subjectId, verbId, objectId].join('-');
}

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
  logger?: loggerModule.ILogger;
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
  knownasEntityId: number | undefined;
  tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'entity-erd-');
  theme = 'forest';
  logger: loggerModule.ILogger;

  constructor({ prisma, knownas, savepath, logger }: IErdArgs) {
    this.prisma = prisma;
    if (!!knownas) {
      this.knownas = normalise(knownas);
    }
    if (!!savepath) {
      this.savepath = savepath;
    }
    this.logger = logger ? logger : loggerModule.logger;
  }

  async _populateActions() {
    if (this.knownas !== undefined) {
      await this._populateActionsForKnownAs();
    }
    else {
      await this._populateActionsFromAll();
    }

    if (this.actions.length === 0) {
      throw new Error(`No actions to graph for "${this.knownas || 'all'}"`);
    }

    this.logger.debug(`_populateActions exits with ${this.actions.length} actions.`);
  }

  async _populateActionsFromAll() {
    this.logger.debug('Enter _graphActionsForAll');
    this.actions.push(
      ... await this.prisma.action.findMany({
        include: {
          Subject: true,
          Object: true,
          Verb: true,
        }
      })
    );
  }


  async _populateActionsForKnownAs() {
    if (this.knownas === undefined) {
      throw new TypeError('._populateActionsForKnownAs called without .knownas');
    }
    this.logger.debug(`Enter _populateActionsForKnownAs with "${this.knownas}"`);

    if (!this.knownasEntityId) {
      const knownasEntity = await this.prisma.entity.findFirst({
        where: { knownas: this.knownas },
        select: { id: true },
      });

      if (knownasEntity === null) {
        throw new EntityNotFoundError(this.knownas);
      }

      this.knownasEntityId = knownasEntity.id;
    }

    this.logger.debug(`._populateActionsForKnownAs for "${this.knownas}", entityId="${this.knownasEntityId}"`);

    this.actions.push(
      ...await this.prisma.action.findMany({
        where: {
          OR: [
            { objectId: this.knownasEntityId },
            { subjectId: this.knownasEntityId },
          ],
        },
        select: {
          Subject: true,
          Object: true,
          Verb: true,
        },
      })
    );
  }

  async useGraphviz(inputGraph?: string) {
    this.logger.info(`Enter useGraphviz`);
    if (!this.savepath) {
      throw new Error('savepath was not supplied during construction');
    }

    const graph = await this._actions2graph();

    const tempOutputPath = path.resolve(
      path.join(this.tmpDir, 'temp.dot'),
    );

    fs.writeFileSync(tempOutputPath, graph);

    child_process.execSync(
      `dot -Tpng ${tempOutputPath} > ${this.savepath}.png`
    );

    if (!process.env.CRUFT) {
      unlinkSync(tempOutputPath);
    }
  }

  async _actions2graph(): Promise<string> {
    let graph = 'digraph  G {';

    await this._populateActions();
    this.logger.debug(`Actions: "${this.actions}"`);

    this.actions.forEach((action) => {
      try {
        if (action.Subject.id && action.Verb.id && action.Object.id) {
          graph += `Entity${action.Subject.id} [label=<${action.Subject.knownas}>]
             Entity${action.Object.id} [label=<${action.Object.knownas}>]
             Entity${action.Subject.id} -> Entity${action.Object.id} [label=<${action.Verb.name}>]
            `;
        }
      } catch (e) {
        this.logger.error('Action was:', action);
        throw e;
      }
    });

    graph += "\n}\n"; // EOF

    this.logger.debug(`Graph: "${graph}"`);

    return graph;
  }
}
