/**
 * @jest-environment ./test/lib/prisma-test-env.ts
 */

import { Person, Action } from '@prisma/client';
import { MockProxy } from 'jest-mock-extended';
import { mockPrisma } from 'testlib/mock-prisma';
import { Erd, PersonNotFoundError } from './erd';

const actionFixture: MockProxy<Action> = {
  start: new Date(),
  end: new Date(),
  subjectId: 1,
  objectId: 1,
  verbId: 1
};

const personFixture: MockProxy<Person> = {
  id: 1,
  knownas: 'Oswald',
  givenname: '',
  middlenames: null,
  familyname: '',
  dob: null,
  dod: null,
  published: false,
};

describe('erd', () => {
  describe('_getActions', () => {
    it('throws the correct error when person not found', async () => {
      mockPrisma.person.findFirst.mockResolvedValue(null);

      const erd = new Erd({ prisma: mockPrisma, knownas: 'no person' });

      await expect(
        erd._getActions()
      ).rejects.toBeInstanceOf(PersonNotFoundError);
    });

    it('returns actions', async () => {
      mockPrisma.action.findMany.mockResolvedValue([actionFixture]);
      mockPrisma.person.findFirst.mockResolvedValue(personFixture);

      const erd = new Erd({ prisma: mockPrisma, knownas: personFixture.knownas, });
      const actionsArray = await erd._getActions();

      expect(actionsArray).toBeDefined();
      expect(actionsArray).toHaveLength(1);
      expect(actionsArray[0]).toEqual(actionFixture);
    });
  });
});
