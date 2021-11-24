import PrismaTestEnvironment from "testlib/prisma-test-env";


import { Entity } from '@prisma/client';
import { prisma, setup, teardown } from 'testlib/fixtures';

PrismaTestEnvironment.init();

beforeEach(async () => await setup());
afterEach(async () => await teardown());

describe('Initial scheme', () => {
  it('all entities are connected', async () => {
    const entities: Entity[] = await prisma.entity.findMany();
    expect(entities).toBeInstanceOf(Array);
    expect(entities.map(_ => _.formalname)).toContain("John F Kennedy");
    expect(entities.map(_ => _.formalname)).toContain("Lee Harvey Oswald");
    expect(entities.map(_ => _.formalname)).toContain("Arthur M Young");
  });
});

