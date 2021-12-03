import { Entity, Predicate, Verb } from '@prisma/client';
import { MockProxy } from 'jest-mock-extended';
import { mockPrisma } from 'testlib/mock-prisma';
import { DAO, EntityNotFoundError } from 'src/service/dao';
import PrismaTestEnvironment from 'testlib/prisma-test-env';

PrismaTestEnvironment.init();

const verbFixture: MockProxy<Verb> = {
  name: 'mock-name',
  description: 'mock description',
  id: 1,
  stem: '{mock-stem}'
};

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

let dao: DAO;

beforeEach(() => {
  dao = new DAO({ prisma: mockPrisma });
});

describe('dao', () => {

  describe('getPredicatesByKnownAs', () => {
    it('throws the correct error when entity not found', async () => {
      mockPrisma.entity.findFirst.mockResolvedValue(null);
      await expect(
        dao.getPredicatesByKnownAs('mock-value-no-entity')
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('returns predicates', async () => {
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);

      const predicates = await dao.getPredicatesByKnownAs(entityFixture.knownas);
      expect(predicates).toBeInstanceOf(Array);
      expect(predicates[0]).toEqual(predicateFixture);
    });

    it('throws the correct error when entity not found', async () => {
      mockPrisma.predicate.findFirst.mockResolvedValue(null);
      await expect(
        dao.getPredicatesByKnownAs('mock-value-no-entity')
      ).rejects.toBeInstanceOf(EntityNotFoundError);
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
      mockPrisma.entity.findMany.mockResolvedValue([entityFixture]);
      const entities = await dao.entitySearch('Osw');
      expect(entities).toBeInstanceOf(Array);
      expect(entities[0]).toEqual(entityFixture);
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
