// Rendering based on node_modules\prisma-erd-generator\src\generate.ts

import * as path from 'path';
import * as child_process from 'child_process';
import fs, { unlinkSync } from 'fs';
import os from 'os';
import { PrismaClient, Prisma, Entity, Verb, Action } from '@prisma/client';
import * as loggerModule from './logger';

export function normaliseArray(list: string[]): string[] {
  return list.map(subject => normalise(subject));
}

export function normalise(subject: string): string {
  return subject.toLowerCase().replace(/[^\w\s'-]+/, '').replace(/\s+/gs, ' ').trim()
}

export function makeActionId(subjectId: number, verbId: number, objectId: number): string {
  return [subjectId, verbId, objectId].join('-');
}

export type SimpleAction = {
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
  savepath?: string;
  logger?: loggerModule.ILogger;
  format?: string;
  layout?: string;
  layouts?: string[];
}

export class Erd {
  static layouts: { [key: string]: string } = {
    circo: "sep = 2 \n esep = 2 \n weight = 20.0 \n fontSize = 28.0 \n penwidth = 20.0 \n",
    fdp: "sep=2 \n esep=2 \n weight=2 \n penwidth=3",
    twopi: "",
    dot: "",
  };
  logger: loggerModule.ILogger;

  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;
  actions: (SimpleAction & Action)[] = []; // TODO types
  savepath: string = 'erd-output.svg';
  entityKnownas2Id: { [key: string]: number } = {};
  tmpDir = fs.mkdtempSync(os.tmpdir() + path.sep + 'entity-erd-');
  format = '';
  layout = 'fdp';

  constructor({ prisma, savepath, logger, format }: IErdArgs) {
    this.prisma = prisma;
    if (!!savepath) {
      this.savepath = savepath;
    }
    if (this.savepath.length < 5) {
      throw new TypeError('savepath too short');
    }
    this.format = format || this.savepath.substr(this.savepath.length - 3, 3);
    this.logger = logger ? logger : loggerModule.logger;
  }

  async _populateActions(knownas?: string | string[]) {
    if (!!knownas) {
      const subject = knownas instanceof Array ? normaliseArray(knownas) : normalise(knownas);
      await this._populateActionsForKnownAs(subject);
    }
    else {
      await this._populateActionsFromAll();
    }

    if (this.actions.length === 0) {
      throw new Error(`No actions to graph for "${knownas || 'all'}"`);
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
          Verb: true
        }
      })
    );
  }


  async _populateActionsForKnownAs(knownasInput: string | string[]) {
    const knownasList = knownasInput instanceof Array ? knownasInput : [knownasInput];

    for (let knownasListIndex = 0; knownasListIndex < knownasList.length; knownasListIndex++) {
      if (knownasList[knownasListIndex] === undefined) {
        throw new TypeError('._populateActionsForKnownAs called without .knownas');
      }
      this.logger.debug(`Enter _populateActionsForKnownAs with "${knownasList[knownasListIndex]}"`);

      if (!this.entityKnownas2Id[knownasList[knownasListIndex]]) {
        const knownasEntity = await this.prisma.entity.findFirst({
          where: { knownas: knownasList[knownasListIndex] },
          select: { id: true },
        });

        if (knownasEntity === null) {
          throw new EntityNotFoundError(knownasList[knownasListIndex]);
        }

        this.entityKnownas2Id[knownasList[knownasListIndex]] = knownasEntity.id;
      }

      this.logger.debug(`._populateActionsForKnownAs for "${knownasList[knownasListIndex]}", entityId = "${this.entityKnownas2Id[knownasList[knownasListIndex]]}"`);

      this.actions.push(
        ...await this.prisma.action.findMany({
          where: {
            OR: [
              { objectId: this.entityKnownas2Id[knownasList[knownasListIndex]] },
              { subjectId: this.entityKnownas2Id[knownasList[knownasListIndex]] },
            ],
          },
          include: {
            Subject: true,
            Object: true,
            Verb: true,
          },
        })
      );
    }
  }

  async graphviz(knownas?: string | string[]) {
    this.logger.info(`Enter useGraphviz`);

    if (!this.savepath) {
      throw new Error('savepath was not supplied during construction');
    }

    await this._populateActions(knownas);

    const graph = await this._actions2graph();

    const tempOutputPath = path.resolve(
      path.join(this.tmpDir, 'temp.dot'),
    );

    fs.writeFileSync(tempOutputPath, graph);

    child_process.execSync(
      `dot -T${this.format} ${tempOutputPath} > ${this.savepath} `
    );

    if (!process.env.CRUFT) {
      unlinkSync(tempOutputPath);
    }
  }

  async _actions2graph(): Promise<string> {
    let graph = `digraph  G {
  layout=${this.layout}
  stylesheet="./styles.css"
  fontsize="32pt"
  ${Erd.layouts[this.layout]}
  `;

    this.logger.debug(`Actions: "${this.actions}"`);

    this.actions.forEach((action) => {
      try {
        if (action.Subject.id && action.Verb.id && action.Object.id) {
          let verbLabel = action.Verb.name;
          if (action.start || action.end) {
            if (action.start) {
              verbLabel += action.start;
            }
            verbLabel += '-';
            if (action.end) {
              verbLabel += action.end;
            }
            verbLabel += ' (';
            verbLabel += ' )';
          }

          graph += `
Entity${action.Subject.id} [class=entity label=<${action.Subject.formalname}>]
Entity${action.Object.id} [class=entity label=<${action.Object.formalname}>]
Entity${action.Subject.id} -> Entity${action.Object.id} [class=verb label=<${verbLabel}>] `;
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
