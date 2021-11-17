import { mockDeep } from 'jest-mock-extended';
import { Action, PrismaClient as OriginalPrismaClient } from '@prisma/client';
import * as fs from 'fs';

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
  it('Lee Harvey Oswald', async () => {
    const savepath = './temp.svg';
    if (fs.existsSync(savepath)) {
      fs.unlinkSync(savepath);
    }

    const rvArray = await erd(prisma, fixtures.oswald.knownas, savepath);
    expect(rvArray).toBeDefined();

    rvArray.forEach((rv) => {
      expect(rv).not.toBeNull();
      expect(rv).toHaveProperty('Subject');
      expect(rv).toHaveProperty('Object');
      expect(rv).toHaveProperty('Verb');
    });

    expect(fs.existsSync(savepath)).toBeTruthy();

    // fs.unlinkSync(savepath);
  });
});
