import PrismaTestEnvironment from "testlib/prisma-test-env";

import { Entity, Predicate } from '@prisma/client';
import { MockProxy } from 'jest-mock-extended';
import { mockPrisma } from 'testlib/mock-prisma';
import { Erd, EntityNotFoundError, normalise } from './erd';

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

describe('erd', () => {
  describe('normalise', () => {
    test.each`
      input     | expectedResult
      ${' xxxx '}  | ${'xxxx'}
      ${' x  x '}   | ${'x x'}
    `('normalises $input to $expectedResult', ({ input, expectedResult }) => {
      expect(normalise(input)).toBe(expectedResult)
    })
  })

  describe('_getPredicates', () => {
    it('throws the correct error when entity not found', async () => {
      mockPrisma.entity.findFirst.mockResolvedValue(null);

      const erd = new Erd({ prisma: mockPrisma });

      await expect(
        erd._populatePredicates('mock-value-no-entity')
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('returns predicates', async () => {
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);
      mockPrisma.entity.findFirst.mockResolvedValue(entityFixture);

      const erd = new Erd({ prisma: mockPrisma });
      await erd._populatePredicates(entityFixture.knownas);

      expect(erd.predicates).toBeDefined();
      expect(erd.predicates).toHaveLength(1);
      expect(erd.predicates[0]).toEqual(predicateFixture);
    });
  });
});
