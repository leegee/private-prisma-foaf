/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

import { Entity } from '@prisma/client';
import { prisma, setup, teardown } from 'testlib/fixtures';

beforeAll(async () => await setup());

afterAll(async () => await teardown());

let entities: Entity[];

describe('Initial scheme', () => {
  beforeAll(async () => {
    entities = await prisma.entity.findMany();
  });

  it('all entities are connected', async () => {
    expect(entities).toBeInstanceOf(Array);
    expect(entities.map(_ => _.formalname)).toContain("John F Kennedy");
    expect(entities.map(_ => _.formalname)).toContain("Lee Harvey Oswald");
    expect(entities.map(_ => _.formalname)).toContain("Arthur M Young");

    // entities.forEach(async (entity) => {
    //   const rv = await prisma.action.findMany({
    //     where: {
    //       subjectId: entity.id
    //     },
    //     select: {
    //       start: true,
    //       end: true,
    //       Subject: true,
    //       Object: true,
    //       Verb: true,
    //     }
    //   });

    //   console.log(entity.knownas, rv);
    //   expect(rv).toHaveLength(1);
    // });
  });
});

