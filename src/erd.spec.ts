import { mockDeep } from 'jest-mock-extended';
import { Action, PrismaClient as OriginalPrismaClient } from '@prisma/client';
import * as fs from 'fs';

import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';
import { erd, _getActions, _getActionsGraph, _save } from './erd';

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

afterAll(async () => {
  await teardown(testId);
});


describe('erd', () => {
  const knownas = fixtures.oswald.knownas;

  describe('Lee Harvey Oswald', async () => {
    it('public', async () => {
      const savepath = './temp-pub.svg';
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      erd(prisma, knownas, savepath, true);

      expect(fs.existsSync(savepath)).toBeTruthy();
      // fs.unlinkSync(savepath);
    });

    it('internals', async () => {
      const savepath = './temp-int.svg';
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      const rvArray = await _getActions(prisma, knownas);
      expect(rvArray).toBeDefined();

      rvArray.forEach((rv) => {
        expect(rv).not.toBeNull();
        expect(rv).toHaveProperty('Subject');
        expect(rv).toHaveProperty('Object');
        expect(rv).toHaveProperty('Verb');
      });

      const actionsSubjectObject = await _getActionsGraph(prisma, knownas);
      const actionsObjectSubject = await _getActionsGraph(prisma, knownas, true);

      _save([actionsSubjectObject, actionsObjectSubject], savepath);

      expect(fs.existsSync(savepath)).toBeTruthy();
      // fs.unlinkSync(savepath);
    });
  });
});
