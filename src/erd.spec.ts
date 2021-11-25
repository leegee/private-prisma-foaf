import PrismaTestEnvironment from "testlib/prisma-test-env";

import { Entity, Action } from '@prisma/client';
import { MockProxy } from 'jest-mock-extended';
import { mockPrisma } from 'testlib/mock-prisma';
import { Erd, EntityNotFoundError } from './erd';

const actionFixture: MockProxy<Action> = {
  start: new Date(),
  end: new Date(),
  subjectId: 1,
  objectId: 1,
  verbId: 1
};

const entityFixture: MockProxy<Entity> = {
  id: 1,
  knownas: 'Oswald',
  formalname: 'Lee Harvey Oswald',
  givenname: '',
  middlenames: null,
  familyname: '',
  dob: null,
  dod: null,
  approved: false,
};

PrismaTestEnvironment.init();

describe('erd', () => {
  describe('_getActions', () => {
    it('throws the correct error when entity not found', async () => {
      mockPrisma.entity.findFirst.mockResolvedValue(null);

      const erd = new Erd({ prisma: mockPrisma });

      await expect(
        erd._populateActions('mock-value-no-entity')
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('returns actions', async () => {
      mockPrisma.action.findMany.mockResolvedValue([actionFixture]);
      mockPrisma.entity.findFirst.mockResolvedValue(entityFixture);

      const erd = new Erd({ prisma: mockPrisma });
      await erd._populateActions(entityFixture.knownas);

      expect(erd.actions).toBeDefined();
      expect(erd.actions).toHaveLength(1);
      expect(erd.actions[0]).toEqual(actionFixture);
    });
  });
});
