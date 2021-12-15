import { Entity, Predicate, Verb } from '@prisma/client';
import { MockProxy } from 'jest-mock-extended';
import { mockPrisma } from 'testlib/mock-prisma';
import { DAO, EntityNotFoundError, normaliseEntity, normaliseVerb } from 'src/service/dao';

import PrismaTestEnvironment from 'testlib/prisma-test-env';
PrismaTestEnvironment.setup({ ingest: false });

const verbFixture: MockProxy<Verb> = {
  name: 'mock-name',
  description: 'mock description',
  id: 1,
};

const predicateFixture: MockProxy<Predicate> = {
  start: new Date(),
  end: new Date(),
  subjectId: 1,
  objectId: 1,
  verbId: 1
};

const oswaldEntityFixture: MockProxy<Entity> = {
  id: 1,
  knownas: 'oswald',
  formalname: 'Lee Harvey Oswald',
  givenname: '',
  middlenames: null,
  familyname: '',
  dob: null,
  dod: null,
  approved: false,
};

let dao: DAO;

beforeEach(() => {
  dao = new DAO({ prisma: mockPrisma });
});

describe('dao', () => {
  describe('normaliseEntity', () => {
    test.each`
      input       | expectedResult
      ${' xxxx '} | ${'xxxx'}
      ${' x  x '} | ${'x x'}
      ${' '}      | ${''}
      ${''}       | ${''}
    `('normalises $input to $expectedResult', ({ input, expectedResult }) => {
      expect(normaliseEntity(input)).toBe(expectedResult)
    });
  });

  describe('normaliseVerb', () => {
    test.each`
      input       | expectedResult
      ${'assassinates'} | ${'assassinate'}
    `('normalises $input to $expectedResult', ({ input, expectedResult }) => {
      expect(normaliseVerb(input)).toEqual(expectedResult)
    });
  });

  describe('getPredicatesByKnownAs', () => {
    it('throws the correct error when entity not found', () => {
      mockPrisma.entity.findFirst.mockResolvedValue(null);
      expect(
        dao.getPredicatesByKnownAs('mock-value-no-entity')
      ).rejects.toThrow(EntityNotFoundError);
    });

    it('returns predicates', async () => {
      mockPrisma.entity.findFirst.mockResolvedValue(oswaldEntityFixture);
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);

      const predicates = await dao.getPredicatesByKnownAs(oswaldEntityFixture.knownas);
      expect(predicates).toBeInstanceOf(Array);
      expect(predicates[0]).toEqual(predicateFixture);
    });

  });

  describe('getAllPredicates', () => {
    it('returns predicates', async () => {
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);

      const predicates = await dao.getAllPredicates();
      expect(predicates).toBeInstanceOf(Array);
      expect(predicates[0]).toEqual(predicateFixture);
    });
  });


  describe('entitySearch', () => {
    it('returns entities', async () => {
      mockPrisma.entity.findMany.mockResolvedValue([oswaldEntityFixture]);
      const entities = await dao.entitySearch('Osw');
      expect(entities).toBeInstanceOf(Array);
      expect(entities[0]).toEqual(oswaldEntityFixture);
    });
  });

  describe('verbSearch', () => {
    it('returns verbs', async () => {
      mockPrisma.verb.findMany.mockResolvedValue([verbFixture]);
      const verbs = await dao.verbSearch('Osw');
      expect(verbs).toBeInstanceOf(Array);
      expect(verbs[0]).toEqual(verbFixture);
    });
  });
});
