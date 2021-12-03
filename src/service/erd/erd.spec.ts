import PrismaTestEnvironment from "testlib/prisma-test-env";

import { Entity, Predicate } from '@prisma/client';
import { MockProxy } from 'jest-mock-extended';
import { mockDao, mockPrisma } from 'testlib/mock-prisma';
import { Erd, normalise } from 'src/service/erd/erd';
import { EntityNotFoundError } from "../dao";

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

      const erd = new Erd({ dao: mockDao });

      await expect(
        erd.getPredicates('mock-value-no-entity')
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('returns predicates', async () => {
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);
      mockPrisma.entity.findFirst.mockResolvedValue(entityFixture);

      const erd = new Erd({ dao: mockDao });
      await erd.getPredicates(entityFixture.knownas);

      expect(erd.predicates).toBeDefined();
      expect(erd.predicates).toHaveLength(1);
      expect(erd.predicates[0]).toEqual(predicateFixture);
    });
  });
});
