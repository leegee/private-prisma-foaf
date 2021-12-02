import PrismaTestEnvironment from "testlib/prisma-test-env";

import { Entity, Predicate } from '@prisma/client';
import { MockProxy } from 'jest-mock-extended';
import { mockPrisma } from 'testlib/mock-prisma';
import { DAO, EntityNotFoundError } from 'src/service/dao';

const predicateFixture: MockProxy<Predicate> = {
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
jest.setTimeout(1000 * 40);

let dao: DAO;

beforeEach(() => {
  dao = new DAO({ prisma: mockPrisma });
});

describe('erd', () => {

  describe('_getPredicates', () => {
    it('throws the correct error when entity not found', async () => {
      mockPrisma.entity.findFirst.mockResolvedValue(null);

      await expect(
        dao._getPredicatesByKnownAs('mock-value-no-entity')
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('returns predicates', async () => {
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);
      mockPrisma.entity.findFirst.mockResolvedValue(entityFixture);

      const predicates = await dao._getPredicatesByKnownAs(entityFixture.knownas);
      expect(predicates).toBeInstanceOf(Array);
      expect(predicates).toHaveLength(1);
      expect(predicates[0]).toEqual(predicateFixture);
    });
  });
});
