/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */


import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;
const mockPrisma: MockPrisma = mockDeep<PrismaClient>();

import { Erd } from './erd';

const knownas = 'Lee Harvey Oswald';

beforeAll(async () => {
  mockReset(mockPrisma);
});

describe('erd', () => {
  describe('Lee Harvey Oswald', () => {
    it('_getActions', async () => {

      mockPrisma.person.findFirst.mockResolvedValue({
        id: 1,
        knownas: 'Lee Harvey Oswald',
        givenname: '',
        middlenames: null,
        familyname: '',
        dob: null,
        dod: null,
        published: false,
      });

      const actionFixture = {
        start: new Date(),
        end: new Date(),
        subjectId: 1,
        objectId: 1,
        verbId: 1
      };

      mockPrisma.action.findMany.mockResolvedValue([actionFixture]);

      const erd = new Erd({ prisma: mockPrisma, knownas, });
      const actionsArray = await erd._getActions();

      expect(actionsArray).toBeDefined();
      expect(actionsArray).toHaveLength(1);

      expect(actionsArray[0]).toEqual(actionFixture);

      //   actionsArray.forEach((rv) => {
      //     expect(rv).not.toBeNull();
      //     expect(rv).toHaveProperty('Subject');
      //     expect(rv).toHaveProperty('Object');
      //     expect(rv).toHaveProperty('Verb');
      //   });
    });


  });
});
