// import { mockDeep } from 'jest-mock-extended';
// import { PrismaClient as OriginalPrismaClient } from '@prisma/client';
import * as fs from 'fs';

import { IFixtures, prisma, setup, teardown } from 'testlib/fixtures';
import { Erd } from './erd';

// jest.mock('@prisma/client', () => ({
//   PrismaClient: function () {
//     return mockDeep<OriginalPrismaClient>();
//   }
// }));

const testId = 'erd';

let fixtures: IFixtures;
let knownas: string;

beforeAll(async () => {
  fixtures = await setup(testId);
  knownas = fixtures.oswald.knownas;
});

afterAll(async () => {
  await teardown(testId);
});


describe('erd', () => {
  describe('Lee Harvey Oswald', () => {
    /*
    it('_getActions', async () => {
      const actionsArray = await _getActions(prisma, knownas);
      expect(actionsArray).toBeDefined();

      actionsArray.forEach((rv) => {
        expect(rv).not.toBeNull();
        expect(rv).toHaveProperty('Subject');
        expect(rv).toHaveProperty('Object');
        expect(rv).toHaveProperty('Verb');
      });
    });

    it('_getActionsGraph _composeGraph _save', async () => {
      const savepath = './temp-int.svg';
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      const actionsSubjectObject = await _getActionsGraph(prisma, knownas);
      const actionsObjectSubject = await _getActionsGraph(prisma, knownas, true);

      const graph = _composeGraph([actionsSubjectObject, actionsObjectSubject]);

      _save(graph, savepath);

      expect(fs.existsSync(savepath)).toBeTruthy();
      // fs.unlinkSync(savepath);
    });
    */

    it.only('public method', async () => {
      const savepath = './temp-pub.svg';
      if (fs.existsSync(savepath)) {
        fs.unlinkSync(savepath);
      }

      const erd = new Erd({ prisma, knownas, savepath, invertedRelationship: true });
      await erd.createFile();

      const exists = fs.existsSync(savepath);

      expect(exists).toBeTruthy();
      // fs.unlinkSync(savepath);
    });

  });
});
