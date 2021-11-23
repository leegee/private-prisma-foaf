// Rendering based on node_modules\prisma-erd-generator\src\generate.ts

import * as path from 'path';
import * as child_process from 'child_process';
import fs from 'fs';
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

  /** uses Mermaid with temp files to create an SVG file, get/returns the contents, and remove all files produced. */
  async getSvg(): Promise<string> {
    this.logger.info(`Enter createFile for "${this.knownas || 'all'}" at "${this.savepath}".`);

    let remove = false;

    if (!this.savepath) {
      remove = true;
      this.savepath = 'temp.svg';
    }

    const graph: string = await this.createSvg();

    const svgXml = fs.readFileSync(this.savepath, 'utf8');

    if (remove) {
      fs.unlinkSync(this.savepath);
      delete this.savepath;
    }

    return svgXml;
  }


  async createSvg() {
    const graphedActions = await this._getGraphActions();
    this.logger.debug(`.create: graphedActions "${graphedActions}"`);

    const graph = 'graph TD\n' + graphedActions;

    this.logger.debug(`.create: graph "${graph}"`);

    this._createSvg(graph);
    return graph;
  }

  async _getGraphActions(): Promise<string> {
    let mermaid = '';

    if (this.knownas !== undefined) {
      await this._populateActionsForKnownAs();
    }
    else {
      await this._populateActionsFromAll();
    }

    if (this.actions.length === 0) {
      throw new Error(`No actions to graph for "${this.knownas || 'all'}"`);
    }


    this.actions.forEach((action) => {
      try {
        if (action.Subject.id && action.Verb.id && action.Object.id) {
          mermaid +=
            'Entity' + action.Subject.id +
            '[' + action.Subject.knownas + ']-->' +
            '|' + action.Verb.name + '|' +
            'Entity' + action.Object.id +
            '[' + action.Object.knownas + ']' +
            '\n';
        }
      } catch (e) {
        this.logger.error('Action was:', action);
        throw e;
      }
    });

    return mermaid;
  }

  async _populateActionsFromAll() {
    this.logger.debug('Enter _graphActionsForAll');

    const entities = await this.prisma.entity.findMany({
      select: { id: true }
    });

    // this.logger.debug(`_graphActionsForAll found ${entities.length} entities.`);

    const entityDoneCache = {};

    for (let entity of entities) {
      let actions: SubjectVerbObject[] = await this.prisma.action.findMany({
        where: {
          OR: [
            { objectId: entity.id },
            { subjectId: entity.id },
          ],
        },
        include: {
          Subject: true,
          Object: true,
          Verb: true,
        },
      });

      actions = actions.reduce((prev: any, current: any) => {
        const actionId: string = makeActionId(current.Subject.id, current.Verb.id, current.Object.id);
        return this.actions[actionId as any] ? current : [...prev, current];
      }, actions);

      this.actions.push(...actions);
      this.logger.debug(`_graphActionsForAll found ${actions.length} for entity "${entity.id}" - running total ${this.actions.length}.`);
    }

    this.logger.debug(`_graphActionsForAll exits having found ${this.actions.length} actions for "${this.knownas || 'all'}"`);
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

    const actions: SubjectVerbObject[] = await this.prisma.action.findMany({
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
    });

    this.logger.debug(`._populateActionsForKnownAs "${this.knownas}" actions=${JSON.stringify(actions)}`);
    this.actions.push(...actions);
    this.logger.debug(`._populateActionsForKnownAs for "${this.knownas}", entityId="${this.knownasEntityId}": got "${this.actions.length}"`);
  }

  _createSvg(graph: string): void {
    this.logger.info(`Enter _save for ${graph}`);
    if (!this.savepath) {
      throw new Error('savepath was not supplied during construction');
    }

    const tempMermaidInputFile = path.resolve(
      path.join(this.tmpDir, 'entity-erd.mmd'),
    );
    fs.writeFileSync(tempMermaidInputFile, graph);

    const tempConfigFile = path.resolve(path.join(this.tmpDir, 'config.json'));
    fs.writeFileSync(
      tempConfigFile,
      JSON.stringify({ deterministicIds: true }),
    );

    const mermaidCliNodePath = path.resolve(
      path.join('node_modules', '.bin', 'mmdc'),
    );

    try {
      child_process.execSync(
        `${mermaidCliNodePath} -i ${tempMermaidInputFile} -o ${this.savepath} -t ${this.theme} -c ${tempConfigFile}`
      );
    } catch (e) {
      throw e;
    }

    fs.unlinkSync(tempMermaidInputFile);
    fs.unlinkSync(tempConfigFile);

    // todo: nicer errors
  }
}
