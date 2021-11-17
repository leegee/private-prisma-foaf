import { mockDeep } from 'jest-mock-extended';
import { PrismaClient as OriginalPrismaClient } from '@prisma/client';

import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';
import { erd } from './erd';

const testId = 'erd';

let fixtures: IFixtures;

// jest.mock('@prisma/client', () => ({
//   PrismaClient: function () {
//     return mockDeep<OriginalPrismaClient>();
//   }
// }));

beforeAll(async () => {
  fixtures = await setup(testId);
});

afterAll(async () => await teardown(testId));

describe('erd', () => {
  it('...', async () => {
    const rv = await erd(prisma, 'John F Kennedy');
    expect(rv).toBeDefined();
    console.dir(rv);
  });
});
