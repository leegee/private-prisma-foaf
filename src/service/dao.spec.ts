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

let dao: DAO;

beforeEach(() => {
  dao = new DAO({ prisma: mockPrisma });
});

describe('erd', () => {

  describe('getPredicatesByKnownAs', () => {
    it('throws the correct error when entity not found', async () => {
      mockPrisma.entity.findFirst.mockResolvedValue(null);
      await expect(
        dao.getPredicatesByKnownAs('mock-value-no-entity')
      ).rejects.toBeInstanceOf(EntityNotFoundError);
    });

    it('returns predicates', async () => {
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);
      mockPrisma.entity.findFirst.mockResolvedValue(entityFixture);

      const predicates = await dao.getPredicatesByKnownAs(entityFixture.knownas);
      expect(predicates).toBeInstanceOf(Array);
      expect(predicates[0]).toEqual(predicateFixture);
    });

    it('throws the correct error when entity not found', async () => {
      mockPrisma.entity.findFirst.mockResolvedValue(null);
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


  describe('getEntityPredictive', () => {
    it('returns predicates', async () => {
      mockPrisma.predicate.findMany.mockResolvedValue([predicateFixture]);

      const predicates = await dao.getEntityPredictive('Osw');
      expect(predicates).toBeInstanceOf(Array);
      expect(predicates[0]).toEqual(predicateFixture);
    });
  });

});
